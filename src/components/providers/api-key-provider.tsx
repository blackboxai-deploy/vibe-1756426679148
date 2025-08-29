"use client"

import React, { createContext, useContext } from 'react'
import { useApiKey } from '@/hooks/use-api-key'

interface ApiKeyContextType {
  apiKey: string | null
  isValidated: boolean
  setApiKey: (key: string) => void
  removeApiKey: () => void
  validateApiKey: (key: string) => Promise<boolean>
}

const ApiKeyContext = createContext<ApiKeyContextType | null>(null)

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const apiKeyHook = useApiKey()
  
  return (
    <ApiKeyContext.Provider value={apiKeyHook}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKeyContext() {
  const context = useContext(ApiKeyContext)
  if (!context) {
    throw new Error('useApiKeyContext must be used within an ApiKeyProvider')
  }
  return context
}