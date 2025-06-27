'use client'

import { useState } from 'react'
import { StacksProvider } from '@/components/StacksProvider'
import { WalletConnection } from '@/components/WalletConnection'
import { HealthRecords } from '@/components/HealthRecords'
import { EmergencyContacts } from '@/components/EmergencyContacts'
import { EmergencyAccess } from '@/components/EmergencyAccess'

export default function Home() {
  const [userSession, setUserSession] = useState(null)
  const [activeTab, setActiveTab] = useState('records')

  const tabs = [
    { id: 'records', label: 'My Records', icon: '📋' },
    { id: 'emergency-contacts', label: 'Emergency Contacts', icon: '👥' },
    { id: 'emergency-access', label: 'Emergency Access', icon: '🚨' }
  ]

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

          <div className="max-w-6xl mx-auto">
            <WalletConnection 
              userSession={userSession} 
              setUserSession={setUserSession} 
            />
            
            {userSession && (
              <div>
                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className="mr-2">{tab.icon}</span>
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'records' && (
                    <HealthRecords userSession={userSession} />
                  )}
                  {activeTab === 'emergency-contacts' && (
                    <EmergencyContacts userSession={userSession} />
                  )}
                  {activeTab === 'emergency-access' && (
                    <EmergencyAccess userSession={userSession} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </StacksProvider>
  )
}
