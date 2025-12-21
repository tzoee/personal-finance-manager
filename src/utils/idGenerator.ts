/**
 * Generate a unique ID using timestamp and random string
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 9)
  return `${timestamp}-${randomStr}`
}

/**
 * Generate a short unique ID (8 characters)
 */
export function generateShortId(): string {
  return Math.random().toString(36).substring(2, 10)
}
