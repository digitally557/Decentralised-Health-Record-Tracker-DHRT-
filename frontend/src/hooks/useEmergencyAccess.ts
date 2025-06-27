import { useState, useCallback } from 'react'
import { 
  callPublicFunction,
  callReadOnlyFunction,
  StacksNetwork,
  PostConditionMode 
} from '@stacks/transactions'
import { openContractCall } from '@stacks/connect'

interface EmergencyContact {
  address: string
  contactType: string
  relationship: string
  canAccessAll: boolean
  addedAt: string
  isActive: boolean
}

export function useEmergencyAccess(userSession: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addEmergencyContact = useCallback(async (
    contactAddress: string,
    contactType: string,
    relationship: string,
    canAccessAll: boolean
  ) => {
    if (!userSession?.isUserSignedIn()) {
      throw new Error('User not signed in')
    }

    setIsLoading(true)
    setError(null)

    try {
      await openContractCall({
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with actual contract address
        contractName: 'health-records',
        functionName: 'add-emergency-contact',
        functionArgs: [
          contactAddress,
          contactType,
          relationship,
          canAccessAll
        ],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Emergency contact added:', data)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add emergency contact')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userSession])

  const removeEmergencyContact = useCallback(async (contactAddress: string) => {
    if (!userSession?.isUserSignedIn()) {
      throw new Error('User not signed in')
    }

    setIsLoading(true)
    setError(null)

    try {
      await openContractCall({
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with actual contract address
        contractName: 'health-records',
        functionName: 'remove-emergency-contact',
        functionArgs: [contactAddress],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Emergency contact removed:', data)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove emergency contact')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userSession])

  const emergencyAccessRecord = useCallback(async (
    recordId: number,
    accessReason: string
  ) => {
    if (!userSession?.isUserSignedIn()) {
      throw new Error('User not signed in')
    }

    setIsLoading(true)
    setError(null)

    try {
      await openContractCall({
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with actual contract address
        contractName: 'health-records',
        functionName: 'emergency-access-record',
        functionArgs: [recordId, accessReason],
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('Emergency access granted:', data)
        },
        onCancel: () => {
          console.log('Transaction cancelled')
        }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access record')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userSession])

  const checkEmergencyContact = useCallback(async (
    userAddress: string,
    contactAddress: string
  ) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with actual contract address
        contractName: 'health-records',
        functionName: 'is-emergency-contact',
        functionArgs: [userAddress, contactAddress],
        senderAddress: userAddress,
        network: new StacksNetwork() // Use appropriate network
      })
      
      return result
    } catch (err) {
      console.error('Error checking emergency contact:', err)
      return false
    }
  }, [])

  const canEmergencyAccess = useCallback(async (
    recordId: number,
    emergencyContactAddress: string
  ) => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Replace with actual contract address
        contractName: 'health-records',
        functionName: 'can-emergency-access',
        functionArgs: [recordId, emergencyContactAddress],
        senderAddress: emergencyContactAddress,
        network: new StacksNetwork() // Use appropriate network
      })
      
      return result
    } catch (err) {
      console.error('Error checking emergency access:', err)
      return false
    }
  }, [])

  return {
    addEmergencyContact,
    removeEmergencyContact,
    emergencyAccessRecord,
    checkEmergencyContact,
    canEmergencyAccess,
    isLoading,
    error
  }
}
