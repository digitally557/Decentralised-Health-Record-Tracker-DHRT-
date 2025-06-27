'use client'

import { useState, useEffect } from 'react'
import { Storage } from '@stacks/storage'

interface HealthRecord {
  id: string
  title: string
  date: string
  type: string
  content: string
  sharedWith: string[]
}

interface HealthRecordsProps {
  userSession: any
}

export function HealthRecords({ userSession }: HealthRecordsProps) {
  const [records, setRecords] = useState<HealthRecord[]>([])
  const [newRecord, setNewRecord] = useState({
    title: '',
    type: 'general',
    content: ''
  })
  const [isLoading, setIsLoading] = useState(true)

  const storage = new Storage({ userSession })

  useEffect(() => {
    loadRecords()
  }, [])

  const loadRecords = async () => {
    try {
      const recordsData = await storage.getFile('health-records.json', { decrypt: true })
      if (recordsData) {
        setRecords(JSON.parse(recordsData as string))
      }
    } catch (error) {
      console.log('No existing records found')
    } finally {
      setIsLoading(false)
    }
  }

  const saveRecord = async () => {
    if (!newRecord.title || !newRecord.content) return

    const record: HealthRecord = {
      id: Date.now().toString(),
      title: newRecord.title,
      date: new Date().toISOString(),
      type: newRecord.type,
      content: newRecord.content,
      sharedWith: []
    }

    const updatedRecords = [...records, record]
    setRecords(updatedRecords)

    try {
      await storage.putFile('health-records.json', JSON.stringify(updatedRecords), { encrypt: true })
      setNewRecord({ title: '', type: 'general', content: '' })
    } catch (error) {
      console.error('Error saving record:', error)
    }
  }

  const deleteRecord = async (id: string) => {
    const updatedRecords = records.filter(record => record.id !== id)
    setRecords(updatedRecords)
    
    try {
      await storage.putFile('health-records.json', JSON.stringify(updatedRecords), { encrypt: true })
    } catch (error) {
      console.error('Error deleting record:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center">Loading your health records...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Add New Record */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Health Record</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newRecord.title}
              onChange={(e) => setNewRecord({ ...newRecord, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="e.g., Annual Checkup, Blood Test Results"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={newRecord.type}
              onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="general">General</option>
              <option value="lab-results">Lab Results</option>
              <option value="prescription">Prescription</option>
              <option value="imaging">Imaging</option>
              <option value="vaccination">Vaccination</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              value={newRecord.content}
              onChange={(e) => setNewRecord({ ...newRecord, content: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
              placeholder="Enter medical information, notes, or test results..."
            />
          </div>
          
          <button
            onClick={saveRecord}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
          >
            Save Record
          </button>
        </div>
      </div>

      {/* Existing Records */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Health Records</h2>
        
        {records.length === 0 ? (
          <p className="text-gray-600 text-center py-8">
            No health records yet. Add your first record above.
          </p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.title}</h3>
                    <p className="text-sm text-gray-600">
                      {record.type} • {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteRecord(record.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{record.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
