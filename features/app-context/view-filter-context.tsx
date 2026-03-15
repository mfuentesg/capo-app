"use client"

import { createContext, useContext } from "react"
import type { ViewFilter } from "./types"

interface ViewFilterContextType {
  viewFilter: ViewFilter
  setViewFilter: (filter: ViewFilter) => void
}

export const ViewFilterContext = createContext<ViewFilterContextType | undefined>(undefined)

export function useViewFilter() {
  const ctx = useContext(ViewFilterContext)
  if (ctx === undefined) {
    throw new Error("useViewFilter must be used within an AppContextProvider")
  }
  return ctx
}
