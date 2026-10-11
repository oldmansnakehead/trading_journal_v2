export interface StandardSession {
  value: string
  label: string
  defaultStart: string
  defaultEnd: string
}

export const STANDARD_SESSIONS: readonly StandardSession[] = [
  { value: 'London', label: 'London', defaultStart: '14:00', defaultEnd: '21:00' },
  { value: 'New York', label: 'New York', defaultStart: '19:30', defaultEnd: '02:00' },
  { value: 'London Close', label: 'London Close', defaultStart: '21:00', defaultEnd: '23:00' },
  { value: 'Asia', label: 'Asia', defaultStart: '07:00', defaultEnd: '14:00' },
  { value: 'Tokyo', label: 'Tokyo', defaultStart: '07:00', defaultEnd: '13:00' }
] as const

export const ALLOWED_SESSION_NAMES = ['London', 'New York', 'London Close', 'Asia', 'Tokyo'] as const
export type AllowedSessionName = (typeof ALLOWED_SESSION_NAMES)[number]
