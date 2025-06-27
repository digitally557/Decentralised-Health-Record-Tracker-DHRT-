'use client'

import { showConnect } from '@stacks/connect'
import { useStacks } from './StacksProvider'

interface WalletConnectionProps {
  userSession: any
  setUserSession: (session: any) => void
}

export function WalletConnection({ userSession, setUserSession }: WalletConnectionProps) {
  const { userSession: stacksUserSession, appConfig } = useStacks()

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Decentralized Health Records',
        icon: window.location.origin + '/favicon.ico',
      },
      redirectTo: '/',
      onFinish: () => {
        setUserSession(stacksUserSession)
      },
      userSession: stacksUserSession,
    })
  }

  const disconnectWallet = () => {
    stacksUserSession.signUserOut()
    setUserSession(null)
  }

  if (userSession?.isUserSignedIn()) {
    const userData = userSession.loadUserData()
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Connected</h2>
            <p className="text-gray-600">{userData.profile?.stxAddress?.mainnet}</p>
          </div>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
          >
            Disconnect
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Connect Your Stacks Wallet
      </h2>
      <p className="text-gray-600 mb-6">
        Connect your wallet to access your health records securely stored on the blockchain
      </p>
      <button
        onClick={connectWallet}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md font-semibold"
      >
        Connect Wallet
      </button>
    </div>
  )
}
