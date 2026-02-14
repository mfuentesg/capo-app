/**
 * App Context Types
 *
 * Defines the context for data access (personal vs team)
 */

/**
 * App context type - determines whether data is accessed in personal or team context
 */
export type AppContext =
  | {
      type: "personal"
      userId: string
    }
  | {
      type: "team"
      teamId: string
      userId: string // Current user ID for permissions
    }
