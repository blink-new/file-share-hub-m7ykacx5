import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { KeyRound, FileText, ArrowLeft, Search as SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { blink } from '@/blink/client'
import toast from 'react-hot-toast'

interface FileRecord {
  id: string
  secretCode?: string
}

export function SecretCodeSearch() {
  const [secretCode, setSecretCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!secretCode.trim()) {
      toast.error('Please enter a secret code')
      return
    }

    setLoading(true)
    try {
      const files = await blink.db.files.list({
        where: { secretCode: secretCode.trim() },
        limit: 1
      })

      if (files.length > 0) {
        navigate(`/file/${files[0].id}`)
      } else {
        toast.error('No file found with this secret code')
      }
    } catch {
      // Fallback to localStorage
      const existingFiles = JSON.parse(localStorage.getItem('files') || '[]')
      const foundFile = existingFiles.find((f: FileRecord) => f.secretCode === secretCode.trim())

      if (foundFile) {
        navigate(`/file/${foundFile.id}`)
      } else {
        toast.error('No file found with this secret code')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              File by Atlas
            </h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Upload
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 w-full max-w-2xl"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Find File by Secret Code</h2>
          <p className="text-lg text-gray-600">Enter the secret code to directly access a file.</p>
        </motion.div>

        <div className="w-full max-w-md">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Enter secret code" 
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <SearchIcon className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Find File'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}