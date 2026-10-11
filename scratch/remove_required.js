const fs = require('fs');

// 1. Original scratch task
try {
  const file = 'src/renderer/src/components/views/JournalEntryForm.vue';
  if (fs.existsSync(file)) {
    let data = fs.readFileSync(file, 'utf8');
    data = data.replace(/\s+required\s+class="w-full bg-white border/g, '\n                    class="w-full bg-white border');
    fs.writeFileSync(file, data);
  }
} catch (e) {
  // ignore
}

// 2. Monte Carlo Verification Tests
function mulberry32(seed) {
  let s = Math.floor(seed) >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Test 1: R = [1, -1, 2, 3.5, 1], Shuffle, Simple, Capital = 10,000, Risk = 1%
{
  const rMultiples = [1, -1, 2, 3.5, 1];
  const initialCapital = 10000;
  const riskPct = 1;
  const rng = mulberry32(42);
  let allEqual = true;

  for (let run = 0; run < 1000; run++) {
    const seq = [...rMultiples];
    for (let i = seq.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = seq[i]; seq[i] = seq[j]; seq[j] = t;
    }
    let balance = initialCapital;
    for (let t = 0; t < seq.length; t++) {
      balance += seq[t] * (initialCapital * (riskPct / 100));
    }
    if (Math.abs(balance - 10650) > 1e-6) {
      allEqual = false;
      break;
    }
  }
  console.log('Monte Carlo Test 1 (Shuffle Final Balance == 10,650):', allEqual ? 'PASSED' : 'FAILED');
}

// Test 2: Bootstrap with all R = +1 -> Max DD = 0 in all runs
{
  const rMultiples = [1, 1, 1, 1, 1];
  const initialCapital = 10000;
  const riskPct = 1;
  const rng = mulberry32(99);
  let allZeroDD = true;

  for (let run = 0; run < 1000; run++) {
    let balance = initialCapital;
    let peak = initialCapital;
    let maxDD = 0;
    for (let t = 0; t < 10; t++) {
      const r = rMultiples[Math.floor(rng() * rMultiples.length)];
      balance += r * (initialCapital * (riskPct / 100));
      if (balance > peak) peak = balance;
      else {
        const dd = ((peak - balance) / peak) * 100;
        if (dd > maxDD) maxDD = dd;
      }
    }
    if (maxDD > 0) {
      allZeroDD = false;
      break;
    }
  }
  console.log('Monte Carlo Test 2 (Bootstrap All R=+1 -> Max DD == 0%):', allZeroDD ? 'PASSED' : 'FAILED');
}

console.log('done');
