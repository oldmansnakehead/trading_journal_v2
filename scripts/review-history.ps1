param([string]$Revision = 'HEAD')

# Read-only review of committed source. Never launch Electron or touch userData.
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$nodePath = (Get-Command node).Source
$cacheRoot = Join-Path $projectRoot 'node_modules/.cache/commit-review'
$reportRoot = Join-Path $projectRoot 'docs/reviews'
$logRoot = Join-Path $reportRoot 'logs'
New-Item -ItemType Directory -Force -Path $cacheRoot, $logRoot | Out-Null
$toolsRoot = Join-Path $projectRoot 'node_modules'
$results = [System.Collections.Generic.List[object]]::new()

function Invoke-ReviewCheck($Name, $ToolPath, $Arguments, $LogPath) {
    $started = Get-Date
    & $nodePath $ToolPath @Arguments *> $LogPath
    $code = $LASTEXITCODE
    return [pscustomobject]@{
        name = $Name
        exitCode = $code
        seconds = [math]::Round(((Get-Date) - $started).TotalSeconds, 2)
        log = $LogPath.Substring($projectRoot.Length + 1).Replace('\', '/')
    }
}

Push-Location $projectRoot
try {
    $commits = @(git rev-list --reverse $Revision)
    if ($LASTEXITCODE -ne 0) { throw 'Cannot enumerate commits' }
    foreach ($sha in $commits) {
        $short = $sha.Substring(0, 7)
        $subject = git show -s --format=%s $sha
        $changed = @(git diff-tree --root --no-commit-id --name-only -r $sha)
        $snapshot = Join-Path $cacheRoot $short
        $archive = Join-Path $cacheRoot "$short.zip"
        if (-not (Test-Path -LiteralPath $snapshot)) {
            git archive --format=zip "--output=$archive" $sha
            if ($LASTEXITCODE -ne 0) { throw "Cannot archive $short" }
            Expand-Archive -LiteralPath $archive -DestinationPath $snapshot
        }
        $checks = [System.Collections.Generic.List[object]]::new()
        $hasRuntimeChange = @($changed | Where-Object { $_ -match '^(src/|package(-lock)?\.json$|.*config.*|electron-builder.*|\.storybook/|e2e/|scripts/)' }).Count -gt 0
        Push-Location $snapshot
        try {
            if ($hasRuntimeChange -and (Test-Path -LiteralPath 'tsconfig.node.json')) {
                $checks.Add((Invoke-ReviewCheck 'typecheck:node' (Join-Path $toolsRoot 'typescript/bin/tsc') @('--noEmit', '-p', 'tsconfig.node.json', '--composite', 'false') (Join-Path $logRoot "$short-node.txt")))
            }
            if ($hasRuntimeChange -and (Test-Path -LiteralPath 'tsconfig.web.json')) {
                $checks.Add((Invoke-ReviewCheck 'typecheck:web' (Join-Path $toolsRoot 'vue-tsc/bin/vue-tsc.js') @('--noEmit', '-p', 'tsconfig.web.json', '--composite', 'false') (Join-Path $logRoot "$short-web.txt")))
            }
            if ($hasRuntimeChange -and (Test-Path -LiteralPath 'vitest.config.ts') -and ((Get-Content -LiteralPath 'vitest.config.ts' -Raw) -match "name: 'unit'")) {
                $checks.Add((Invoke-ReviewCheck 'unit' (Join-Path $toolsRoot 'vitest/vitest.mjs') @('run', '--project=unit') (Join-Path $logRoot "$short-unit.txt")))
            }
            if ($sha -eq $commits[-1] -and (Test-Path -LiteralPath 'electron.vite.config.ts')) {
                $checks.Add((Invoke-ReviewCheck 'bundle' (Join-Path $toolsRoot 'electron-vite/bin/electron-vite.js') @('build') (Join-Path $logRoot "$short-build.txt")))
                $checks.Add((Invoke-ReviewCheck 'lint' (Join-Path $toolsRoot 'eslint/bin/eslint.js') @('.') (Join-Path $logRoot "$short-lint.txt")))
            }
        } finally { Pop-Location }
        $results.Add([pscustomobject]@{
            sha = $sha; short = $short; subject = $subject
            dependencyMode = 'shared installed dependencies; not historical lockfile install'
            checks = @($checks.ToArray())
            e2e = 'not run: existing fixtures use real userData'
        })
        ConvertTo-Json -InputObject @($results.ToArray()) -Depth 8 | Set-Content -LiteralPath (Join-Path $reportRoot 'history-checks.json') -Encoding utf8
        $summary = ($checks | ForEach-Object { "$($_.name)=$($_.exitCode)" }) -join ', '
        Write-Output "$short $subject | $summary"
    }
} finally { Pop-Location }
