export interface StandardSession {
  value: string
  label: string
  defaultStart: string
  defaultEnd: string
}

export const STANDARD_SESSIONS: readonly StandardSession[] = [
  { value: 'Asia', label: 'Asia', defaultStart: '07:00', defaultEnd: '12:00' },
  { value: 'London', label: 'London', defaultStart: '14:00', defaultEnd: '18:00' },
  { value: 'New York', label: 'New York', defaultStart: '19:00', defaultEnd: '22:00' },
  { value: 'London Close', label: 'London Close', defaultStart: '22:00', defaultEnd: '00:00' },
  { value: 'Tokyo', label: 'Tokyo', defaultStart: '07:00', defaultEnd: '13:00' }
] as const

export const ALLOWED_SESSION_NAMES = ['London', 'New York', 'London Close', 'Asia', 'Tokyo'] as const
export type AllowedSessionName = (typeof ALLOWED_SESSION_NAMES)[number]

export interface SessionPreset {
  sessionName: AllowedSessionName
  startTime: string
  endTime: string
  description?: string
}

export const DEFAULT_SESSION_PRESETS: readonly SessionPreset[] = [
  { sessionName: 'Asia', startTime: '07:00', endTime: '12:00', description: '07:00 - 12:00' },
  { sessionName: 'London', startTime: '14:00', endTime: '18:00', description: '14:00 - 18:00' },
  { sessionName: 'New York', startTime: '19:00', endTime: '22:00', description: '19:00 - 22:00' },
  { sessionName: 'London Close', startTime: '22:00', endTime: '00:00', description: '22:00 - 00:00' }
] as const
