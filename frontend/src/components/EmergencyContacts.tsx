'use client'

import { useState, useEffect } from 'react'
import { 
  callPublicFunction, 
  callReadOnlyFunction,
  StacksNetwork 
} from '@stacks/transactions'
import { useStacks } from './StacksProvider'

interface EmergencyContact {
  address: string
  contactType: string
  relationship: string
  canAccessAll: boolean
  addedAt: string
  isActive: boolean
}

interface EmergencyContactsProps {
  userSession: any
}

export function EmergencyContacts({ userSession }: EmergencyContactsProps) {
  const [contacts, setContacts] = useState<EmergencyContact[]>([])
  const [newContact, setNewContact] = useState({
    address: '',
    contactType: 'family',
    relationship: '',
    canAccessAll: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [emergencyMode, setEmergencyMode] = useState(false)
  
  const { userSession: stacksUserSession } = useStacks()

  const contactTypes = [
    { value: 'family', label: 'Family Member' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'caregiver', label: 'Caregiver' },
    { value: 'friend', label: 'Trusted Friend' },
    { value: 'legal', label: 'Legal Guardian' }
  ]

  useEffect(() => {
    if (userSession?.isUserSignedIn()) {
      loadEmergencyContacts()
    }
  }, [userSession])

  const loadEmergencyContacts = async () => {
    // In a real implementation, this would call the smart contract
    // For now, we'll simulate with localStorage
    try {
      const stored = localStorage.getItem('emergency-contacts')
      if (stored) {
        setContacts(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading emergency contacts:', error)
    }
  }

  const addEmergencyContact = async () => {
    if (!newContact.address || !newContact.relationship) return

    setIsLoading(true)
    try {
      const contact: EmergencyContact = {
        address: newContact.address,
        contactType: newContact.contactType,
        relationship: newContact.relationship,
        canAccessAll: newContact.canAccessAll,
        addedAt: new Date().toISOString(),
        isActive: true
      }

      const updatedContacts = [...contacts, contact]
      setContacts(updatedContacts)
      localStorage.setItem('emergency-contacts', JSON.stringify(updatedContacts))
      
      setNewContact({
        address: '',
        contactType: 'family',
        relationship: '',
        canAccessAll: true
      })
    } catch (error) {
      console.error('Error adding emergency contact:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const removeEmergencyContact = async (address: string) => {
    try {
      const updatedContacts = contacts.map(contact => 
        contact.address === address 
          ? { ...contact, isActive: false }
          : contact
      ).filter(contact => contact.isActive)
      
      setContacts(updatedContacts)
      localStorage.setItem('emergency-contacts', JSON.stringify(updatedContacts))
    } catch (error) {
      console.error('Error removing emergency contact:', error)
    }
  }

  if (!userSession?.isUserSignedIn()) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 text-center">
          Please connect your wallet to manage emergency contacts
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Emergency Mode Toggle */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-800">Emergency Access Mode</h3>
            <p className="text-red-600 text-sm">
              {emergencyMode 
                ? "Emergency mode is active - contacts can access your records"
                : "Emergency mode is disabled - normal access controls apply"
              }
            </p>
          </div>
          <button
            onClick={() => setEmergencyMode(!emergencyMode)}
            className={`px-4 py-2 rounded-md font-semibold ${
              emergencyMode 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {emergencyMode ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>

      {/* Add New Emergency Contact */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Emergency Contact</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stacks Address
            </label>
            <input
              type="text"
              value={newContact.address}
              onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="SP1234567890ABCDEF..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Type
              </label>
              <select
                value={newContact.contactType}
                onChange={(e) => setNewContact({ ...newContact, contactType: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                {contactTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., Spouse, Doctor, Caregiver"
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="canAccessAll"
              checked={newContact.canAccessAll}
              onChange={(e) => setNewContact({ ...newContact, canAccessAll: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="canAccessAll" className="text-sm text-gray-700">
              Can access all medical records (recommended for family/caregivers)
            </label>
          </div>
          
          <button
            onClick={addEmergencyContact}
            disabled={isLoading || !newContact.address || !newContact.relationship}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-md"
          >
            {isLoading ? 'Adding...' : 'Add Emergency Contact'}
          </button>
        </div>
      </div>

      {/* Emergency Contacts List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Emergency Contacts</h2>
        
        {contacts.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚨</div>
            <p className="text-gray-600 mb-2">No emergency contacts configured</p>
            <p className="text-sm text-gray-500">
              Add trusted contacts who can access your medical records in emergencies
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contacts.filter(contact => contact.isActive).map((contact, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {contactTypes.find(t => t.value === contact.contactType)?.label}
                      </span>
                      {contact.canAccessAll && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Full Access
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">{contact.relationship}</p>
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {contact.address}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Added: {new Date(contact.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => removeEmergencyContact(contact.address)}
                    className="text-red-500 hover:text-red-700 text-sm ml-4"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Emergency Access Instructions */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">How Emergency Access Works</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Emergency contacts can access your records when emergency mode is enabled</li>
          <li>• All emergency access attempts are logged on the blockchain</li>
          <li>• You can revoke emergency access at any time</li>
          <li>• Contacts must provide a reason for accessing your records</li>
          <li>• Only add people you completely trust with your medical information</li>
        </ul>
      </div>
    </div>
  )
}
