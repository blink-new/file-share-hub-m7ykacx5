import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search as SearchIcon, FileText, User, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { blink } from '@/blink/client'
import toast from 'react-hot-toast'

interface FileRecord {
  id: string
  originalName: string
  fileSize: number
  mimeType: string
  uploaderName?: string
}

export function Search() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a name to search')
      return
    }

    setLoading(true)
    try {
      const files = await blink.db.files.list({
        where: { uploaderName: searchTerm.trim() }
      })
      setSearchResults(files)
      if (files.length === 0) {
        toast.success('No files found for this user')
      }
    } catch {
      // Fallback to localStorage
      const existingFiles = JSON.parse(localStorage.getItem('files') || '[]')
      const results = existingFiles.filter((f: FileRecord) => 
        f.uploaderName?.toLowerCase() === searchTerm.trim().toLowerCase()
      )
      setSearchResults(results)
      if (results.length === 0) {
        toast.success('No files found for this user')
      }
    } finally {
      setLoading(false)
    }
  }
  
  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Search for Files</h2>
          <p className="text-lg text-gray-600">Find all files uploaded by a specific person.</p>
        </motion.div>

        <div className="w-full max-w-2xl">
          <div className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input 
                placeholder="Enter uploader's name" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              <SearchIcon className="w-4 h-4 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <ul className="space-y-3">
                  {searchResults.map(file => (
                    <li 
                      key={file.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => navigate(`/file/${file.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">View File</Button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}