import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, FileText, Calendar, HardDrive, Eye, ArrowLeft, Share2, Copy, Check, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { blink } from '@/blink/client'
import toast from 'react-hot-toast'

interface FileRecord {
  id: string
  originalName: string
  fileSize: number
  mimeType: string
  storagePath: string
  publicUrl: string
  downloadCount: number
  createdAt: string
  uploaderName?: string
  secretCode?: string
}

export function FileView() {
  const { fileId } = useParams<{ fileId: string }>()
  const navigate = useNavigate()
  const [file, setFile] = useState<FileRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchFile = async () => {
      if (!fileId) return

      try {
        // Try to fetch from database first
        const files = await blink.db.files.list({
          where: { id: fileId },
          limit: 1
        })

        if (files.length > 0) {
          setFile(files[0])
        } else {
          // Fallback to localStorage
          const existingFiles = JSON.parse(localStorage.getItem('files') || '[]')
          const foundFile = existingFiles.find((f: FileRecord) => f.id === fileId)
          
          if (foundFile) {
            setFile(foundFile)
          } else {
            toast.error('File not found')
            navigate('/')
          }
        }
      } catch (error) {
        console.error('Database error, trying localStorage fallback:', error)
        // Fallback to localStorage
        const existingFiles = JSON.parse(localStorage.getItem('files') || '[]')
        const foundFile = existingFiles.find((f: FileRecord) => f.id === fileId)
        
        if (foundFile) {
          setFile(foundFile)
        } else {
          toast.error('File not found')
          navigate('/')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchFile()
  }, [fileId, navigate])

  const handleDownload = async () => {
    if (!file) return

    setDownloading(true)
    try {
      // Try to update download count in database
      try {
        await blink.db.files.update(file.id, {
          downloadCount: file.downloadCount + 1
        })
      } catch {
        // Update in localStorage if database not available
        const existingFiles = JSON.parse(localStorage.getItem('files') || '[]')
        const fileIndex = existingFiles.findIndex((f: FileRecord) => f.id === file.id)
        if (fileIndex !== -1) {
          existingFiles[fileIndex].downloadCount = file.downloadCount + 1
          localStorage.setItem('files', JSON.stringify(existingFiles))
        }
      }

      // Trigger download
      const link = document.createElement('a')
      link.href = file.publicUrl
      link.download = file.originalName
      link.click()

      // Update local state
      setFile(prev => prev ? { ...prev, downloadCount: prev.downloadCount + 1 } : null)
      
      toast.success('Download started!')
    } catch (error) {
      console.error('Download failed:', error)
      toast.error('Failed to download file')
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
    if (mimeType.includes('doc') || mimeType.includes('docx')) return '📝'
    if (mimeType.includes('xls') || mimeType.includes('xlsx')) return '📊'
    if (mimeType.includes('ppt') || mimeType.includes('pptx')) return '📈'
    return '📄'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!file) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">File Not Found</h2>
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                File by Atlas
              </h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Upload New File
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-3xl">
                    {getFileIcon(file.mimeType)}
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                      {file.originalName}
                    </CardTitle>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span className="flex items-center">
                        <HardDrive className="w-4 h-4 mr-1" />
                        {formatFileSize(file.fileSize)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(file.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {file.downloadCount} downloads
                      </span>
                      {file.uploaderName && (
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {file.uploaderName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Ready for download
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <Separator className="mb-6" />
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 text-lg"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {downloading ? 'Downloading...' : 'Download File'}
                  </Button>
                  
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className="flex-1 sm:flex-initial bg-white hover:bg-gray-50 border-gray-300 font-medium py-3"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">File Type</span>
                    </div>
                    <p className="text-sm text-gray-600 font-mono">{file.mimeType}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <HardDrive className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">File Size</span>
                    </div>
                    <p className="text-sm text-gray-600">{formatFileSize(file.fileSize)}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Share2 className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">File ID</span>
                    </div>
                    <p className="text-sm text-gray-600 font-mono">{file.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}