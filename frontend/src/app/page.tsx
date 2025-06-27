'use client'

import { useState } from 'react'
import { StacksProvider } from '@/components/StacksProvider'
import { WalletConnection } from '@/components/WalletConnection'
import { HealthRecords } from '@/components/HealthRecords'

export default function Home() {
  const [userSession, setUserSession] = useState(null)

  return (
    <StacksProvider>
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Decentralized Health Records
            </h1>
            <p className="text-gray-600">
              Secure, private health record storage on the Stacks blockchain
            </p>
          </header>

          <div className="max-w-4xl mx-auto">
            <WalletConnection 
              userSession={userSession} 
              setUserSession={setUserSession} 
            />
            
            {userSession && (
              <HealthRecords userSession={userSession} />
            )}
          </div>
        </div>
      </main>
    </StacksProvider>
  )
}
