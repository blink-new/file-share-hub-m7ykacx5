import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Folder as FolderIcon, FileText, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface FolderRecord {
  id: string
  name: string
  uploaderName?: string
  createdAt: string
}

interface FileRecord {
  id: string
  originalName: string
  fileSize: number
}

export function FolderView() {
  const { folderId } = useParams<{ folderId: string }>()
  const navigate = useNavigate()
  const [folder, setFolder] = useState<FolderRecord | null>(null)
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFolderAndFiles = async () => {
      if (!folderId) return

      try {
        const existingFolders = JSON.parse(localStorage.getItem('folders') || '[]')
        const foundFolder = existingFolders.find((f: FolderRecord) => f.id === folderId)

        const existingFiles = JSON.parse(localStorage.getItem('files') || '[]')
        const foundFiles = existingFiles.filter((f: { folderId: string | undefined; }) => f.folderId === folderId)

        if (foundFolder) {
          setFolder(foundFolder)
          setFiles(foundFiles)
        } else {
          toast.error('Folder not found')
          navigate('/')
        }
      } catch {
        toast.error('Failed to load folder')
        navigate('/')
      } finally {
        setLoading(false)
      }
    }

    fetchFolderAndFiles()
  }, [folderId, navigate])

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!folder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Folder Not Found</h2>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FolderIcon className="w-5 h-5 text-white" />
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">{folder.name}</CardTitle>
              <p className="text-sm text-gray-600">Uploaded by {folder.uploaderName}</p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {files.map(file => (
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
        </motion.div>
      </main>
    </div>
  )
}