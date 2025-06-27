'use client'

import { useState } from 'react'
import { useStacks } from './StacksProvider'

interface EmergencyAccessProps {
  userSession: any
}

interface AccessAttempt {
  recordId: string
  recordTitle: string
  recordOwner: string
  accessReason: string
  timestamp: string
  status: 'pending' | 'approved' | 'denied'
}

export function EmergencyAccess({ userSession }: EmergencyAccessProps) {
  const [accessForm, setAccessForm] = useState({
    recordOwnerAddress: '',
    accessReason: '',
    urgencyLevel: 'high'
  })
  const [accessHistory, setAccessHistory] = useState<AccessAttempt[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])

  const urgencyLevels = [
    { value: 'critical', label: 'Critical - Life Threatening', color: 'bg-red-100 text-red-800' },
    { value: 'high', label: 'High - Urgent Care Needed', color: 'bg-orange-100 text-orange-800' },
    { value: 'medium', label: 'Medium - Medical Consultation', color: 'bg-yellow-100 text-yellow-800' }
  ]

  const handleEmergencyAccess = async () => {
    if (!accessForm.recordOwnerAddress || !accessForm.accessReason) return

    setIsSubmitting(true)
    try {
      // Simulate emergency access request
      const newAttempt: AccessAttempt = {
        recordId: `emergency-${Date.now()}`,
        recordTitle: 'Emergency Medical Records Access',
        recordOwner: accessForm.recordOwnerAddress,
        accessReason: accessForm.accessReason,
        timestamp: new Date().toISOString(),
        status: 'pending'
      }

      setAccessHistory(prev => [newAttempt, ...prev])
      
      // Simulate processing delay
      setTimeout(() => {
        setAccessHistory(prev => 
          prev.map(attempt => 
            attempt.recordId === newAttempt.recordId 
              ? { ...attempt, status: 'approved' as const }
              : attempt
          )
        )
      }, 2000)

      setAccessForm({
        recordOwnerAddress: '',
        accessReason: '',
        urgencyLevel: 'high'
      })
    } catch (error) {
      console.error('Emergency access error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userSession?.isUserSignedIn()) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 text-center">
          Please connect your wallet to use emergency access
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Emergency Access Banner */}
      <div className="bg-red-600 text-white rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🚨</div>
          <div>
            <h2 className="text-xl font-bold">Emergency Medical Records Access</h2>
            <p className="text-red-100">
              Use this feature only in medical emergencies when immediate access to patient records is critical
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Access Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Emergency Access</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient's Stacks Address *
            </label>
            <input
              type="text"
              value={accessForm.recordOwnerAddress}
              onChange={(e) => setAccessForm({ ...accessForm, recordOwnerAddress: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="SP1234567890ABCDEF..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the Stacks address of the patient whose records you need to access
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urgency Level *
            </label>
            <div className="space-y-2">
              {urgencyLevels.map(level => (
                <label key={level.value} className="flex items-center">
                  <input
                    type="radio"
                    value={level.value}
                    checked={accessForm.urgencyLevel === level.value}
                    onChange={(e) => setAccessForm({ ...accessForm, urgencyLevel: e.target.value })}
                    className="mr-3"
                  />
                  <span className={`px-2 py-1 rounded text-sm ${level.color}`}>
                    {level.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Emergency Access *
            </label>
            <textarea
              value={accessForm.accessReason}
              onChange={(e) => setAccessForm({ ...accessForm, accessReason: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-24"
              placeholder="Describe the medical emergency and why immediate access to patient records is necessary..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This will be logged on the blockchain for audit purposes
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <div className="text-yellow-600 mt-0.5">⚠️</div>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Emergency Access Agreement</p>
                <p>
                  By requesting emergency access, you confirm that you are authorized healthcare personnel 
                  and that immediate access to these medical records is necessary for patient care. 
                  This access will be permanently logged on the blockchain.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleEmergencyAccess}
            disabled={isSubmitting || !accessForm.recordOwnerAddress || !accessForm.accessReason}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-3 rounded-md font-semibold"
          >
            {isSubmitting ? 'Processing Emergency Request...' : 'Request Emergency Access'}
          </button>
        </div>
      </div>

      {/* Access History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Access History</h3>
        
        {accessHistory.length === 0 ? (
          <p className="text-gray-600 text-center py-4">No emergency access requests made</p>
        ) : (
          <div className="space-y-3">
            {accessHistory.map((attempt, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">
                      Emergency Access Request #{attempt.recordId.split('-')[1]}
                    </p>
                    <p className="text-sm text-gray-600">
                      Patient: {attempt.recordOwner.slice(0, 10)}...{attempt.recordOwner.slice(-6)}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    attempt.status === 'approved' ? 'bg-green-100 text-green-800' :
                    attempt.status === 'denied' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Reason:</strong> {attempt.accessReason}
                </p>
                <p className="text-xs text-gray-500">
                  Requested: {new Date(attempt.timestamp).toLocaleString()}
                </p>
                {attempt.status === 'approved' && (
                  <button className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                    View Accessed Records →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legal Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Important Legal Notice</h4>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            Emergency access to medical records is subject to healthcare privacy laws including HIPAA. 
            Only authorized healthcare professionals should use this feature.
          </p>
          <p>
            All emergency access attempts are permanently recorded on the blockchain and may be 
            subject to audit by healthcare authorities and the record owner.
          </p>
          <p>
            Unauthorized access to medical records may result in legal consequences including 
            criminal charges and civil liability.
          </p>
        </div>
      </div>
    </div>
  )
}
