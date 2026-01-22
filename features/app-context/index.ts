/**
 * App Context feature public API
 *
 * Note: Server-only utilities (getSelectedTeamId, getAppContextFromCookies, getTeamsFromServer)
 * are not exported here to avoid bundling server-only code in client components.
 * Import them directly from "@/features/app-context/server" in server components.
 */

export type { AppContext } from "./types"
export { AppContextProvider, useAppContext } from "./context"
export { SELECTED_TEAM_ID_KEY } from "./constants"
export {
  setSelectedTeamId as setClientSelectedTeamId,
  unsetSelectedTeamId as unsetClientSelectedTeamId
} from "./server"
