'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ImportProfile() {
  const [file, setFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<string>('json')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      
      const name = selectedFile.name.toLowerCase()
      if (name.endsWith('.json')) {
        setImportType('json')
      } else if (name.includes('profile')) {
        setImportType('linkedin-profile')
      } else if (name.includes('positions') || name.includes('experience')) {
        setImportType('linkedin-positions')
      } else if (name.includes('skills')) {
        setImportType('linkedin-skills')
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setMessage(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('importType', importType)

    try {
      const res = await fetch('/api/profile/import', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Profile imported successfully!')
        setFile(null)
        router.refresh()
      } else {
        setError(data.error || 'Failed to import profile')
      }
    } catch (err: any) {
      setError('An error occurred during upload: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/20 backdrop-blur-md">
      <h3 className="font-bold text-base mb-3 text-zinc-200">Import Career Data</h3>
      <p className="text-zinc-400 text-xs mb-4">
        Instantly populate your profile by uploading a JSON Resume or LinkedIn CSV export.
      </p>

      <form onSubmit={handleUpload} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">Import Format</label>
          <select
            value={importType}
            onChange={(e) => setImportType(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-900 text-zinc-300 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-emerald-500 transition"
          >
            <option value="json">JSON Resume (.json)</option>
            <option value="linkedin-profile">LinkedIn Profile.csv</option>
            <option value="linkedin-positions">LinkedIn Positions.csv</option>
            <option value="linkedin-skills">LinkedIn Skills.csv</option>
          </select>
        </div>

        <div className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 rounded-xl p-4 text-center cursor-pointer transition relative group">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".json,.csv"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="space-y-1">
            <span className="text-xs text-zinc-400 font-medium block group-hover:text-zinc-300 transition">
              {file ? file.name : 'Click or drag file to upload'}
            </span>
            <span className="text-[10px] text-zinc-600 block">Accepts .json or .csv</span>
          </div>
        </div>

        {file && (
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-semibold text-xs rounded-lg transition"
          >
            {loading ? 'Processing...' : 'Run Importer'}
          </button>
        )}

        {message && <p className="text-xs text-emerald-400 mt-2 font-medium">{message}</p>}
        {error && <p className="text-xs text-red-400 mt-2 font-medium">{error}</p>}
      </form>
    </div>
  )
}
