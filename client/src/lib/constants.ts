export const UNDO_DELAY = 5000
export const STALE_TIME = 5 * 60 * 1000

// Z-index scale — keep in sync with --z-* tokens in theme.css
export const Z = {
  dropdown: 100,
  modal:    400,
  toast:    500,
} as const

export const TABLE_PARAMS = {
  users: 'u',
  roles: 'r',
} as const
