'use client'

import { useState } from 'react'

export default function TestPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  const testEndpoints = async (mode: 'random' | 'untranslatable' | 'slang') => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cron/${mode}`)
      const data = await response.json()
      setResults(prev => ({ ...prev, [mode]: data }))
    } catch (error) {
      console.error(`Error testing ${mode}:`, error)
      setResults(prev => ({ ...prev, [mode]: { error: 'Failed to test' } }))
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Flow Integration</h1>
      
      <div className="space-y-4">
        <button
          onClick={() => testEndpoints('random')}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Test Random Word
        </button>

        <button
          onClick={() => testEndpoints('untranslatable')}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Test Untranslatable Word
        </button>

        <button
          onClick={() => testEndpoints('slang')}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          Test Slang Word
        </button>

        {loading && <div>Loading...</div>}

        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify(results, null, 2)}
        </pre>
      </div>
    </div>
  )
} 