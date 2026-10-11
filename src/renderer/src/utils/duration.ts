export interface TradeDurationInfo {
  text: string
  subText: string
  title: string
  diffMinutes: number | null
  diffMs: number | null
}

/**
 * Calculates holding duration from entryDatetime and exitDatetime.
 * Formula: exit time - entry time
 *
 * @param entry ISO or datetime string of entry
 * @param exit ISO or datetime string of exit
 */
export function calculateTradeDuration(
  entry?: string | null,
  exit?: string | null
): TradeDurationInfo {
  if (!entry || !exit) {
    return {
      text: '-',
      subText: '',
      title: 'No exit time recorded',
      diffMinutes: null,
      diffMs: null
    }
  }

  const entryDate = new Date(entry)
  const exitDate = new Date(exit)
  const entryMs = entryDate.getTime()
  const exitMs = exitDate.getTime()

  if (isNaN(entryMs) || isNaN(exitMs)) {
    return {
      text: '-',
      subText: '',
      title: 'Invalid datetime format',
      diffMinutes: null,
      diffMs: null
    }
  }

  const diffMs = exitMs - entryMs
  if (diffMs < 0) {
    return {
      text: 'Invalid',
      subText: 'Exit < Entry',
      title: 'Exit time is earlier than entry time',
      diffMinutes: null,
      diffMs
    }
  }

  const totalSec = Math.floor(diffMs / 1000)
  const totalMin = Math.floor(totalSec / 60)
  const totalHours = Math.floor(totalMin / 60)
  const diffDays = Math.floor(totalHours / 24)

  const remHours = totalHours % 24
  const remMin = totalMin % 60

  let formatted = ''
  if (diffDays > 0) {
    formatted = remHours > 0 ? `${diffDays}d ${remHours}h` : `${diffDays}d`
  } else if (totalHours > 0) {
    formatted = remMin > 0 ? `${totalHours}h ${remMin}m` : `${totalHours}h`
  } else if (totalMin > 0) {
    formatted = `${totalMin}m`
  } else if (totalSec > 0) {
    formatted = `${totalSec}s`
  } else {
    formatted = '< 1m'
  }

  // Format subtext showing exit time
  const isSameDay = entryDate.toDateString() === exitDate.toDateString()
  const exitTimeStr = exitDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const exitDateStr = exitDate.toLocaleDateString([], { month: 'numeric', day: 'numeric' })
  const subText = isSameDay ? `Exit ${exitTimeStr}` : `Exit ${exitDateStr} ${exitTimeStr}`

  const title = `Entry: ${entryDate.toLocaleString()}\nExit: ${exitDate.toLocaleString()}\nDuration: ${formatted}`

  return {
    text: formatted,
    subText,
    title,
    diffMinutes: totalMin,
    diffMs
  }
}
