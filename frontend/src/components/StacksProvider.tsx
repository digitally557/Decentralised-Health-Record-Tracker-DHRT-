'use client'

import { createContext, useContext, ReactNode } from 'react'
import { AppConfig, UserSession } from '@stacks/connect'

const appConfig = new AppConfig(['store_write', 'publish_data'])

interface StacksContextType {
  userSession: UserSession
  appConfig: AppConfig
}

const StacksContext = createContext<StacksContextType | null>(null)

export function StacksProvider({ children }: { children: ReactNode }) {
  const userSession = new UserSession({ appConfig })

  return (
    <StacksContext.Provider value={{ userSession, appConfig }}>
      {children}
    </StacksContext.Provider>
  )
}

export function useStacks() {
  const context = useContext(StacksContext)
  if (!context) {
    throw new Error('useStacks must be used within a StacksProvider')
  }
  return context
}
