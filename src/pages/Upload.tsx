import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, FileText, Check, Loader2, User, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { blink } from '@/blink/client'
import toast from 'react-hot-toast'

export function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploaderName, setUploaderName] = useState('')
  const [secretCode, setSecretCode] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const navigate = useNavigate()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    if (!uploaderName.trim()) {
      toast.error('Please enter your name')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Generate unique file ID
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Upload to Blink storage
      const { publicUrl } = await blink.storage.upload(
        file,
        `files/${fileId}`,
        {
          onProgress: (percent) => setUploadProgress(percent),
        }
      )

      // Create file record
      const fileRecord = {
        id: fileId,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        storagePath: `files/${fileId}`,
        publicUrl: publicUrl,
        downloadCount: 0,
        createdAt: new Date().toISOString(),
        uploaderName: uploaderName.trim(),
        secretCode: secretCode.trim(),
      }

      try {
        // Try to save to database
        await blink.db.files.create(fileRecord)
      } catch {
        console.log('Database not ready, using localStorage fallback')
        // Fallback to localStorage
        const existingFiles = JSON.parse(localStorage.getItem('files') || '[]')
        existingFiles.push(fileRecord)
        localStorage.setItem('files', JSON.stringify(existingFiles))
      }

      toast.success('File uploaded successfully!')
      navigate(`/file/${fileId}`)

    } catch (error) {
      console.error('Upload failed:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
      setUploadProgress(0)
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
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              File by Atlas
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Share Files Instantly
            </h2>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Upload any file and get a shareable link that works anywhere, anytime
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-2 border-dashed border-gray-300 transition-all duration-300 hover:border-blue-400 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-8">
                <div
                  className={`relative ${dragActive ? 'bg-blue-50 border-blue-400' : ''} transition-all duration-300 rounded-lg p-8 border-2 border-dashed ${
                    dragActive ? 'border-blue-400' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  
                  <div className="text-center">
                    <motion.div
                      animate={{
                        scale: dragActive ? 1.1 : 1,
                        rotate: dragActive ? 5 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    </motion.div>
                    
                    <p className="text-xl font-semibold text-gray-700 mb-2">
                      {dragActive ? 'Drop your file here' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-gray-500 mb-4">
                      or click to browse
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                          placeholder="Your Name" 
                          value={uploaderName}
                          onChange={(e) => setUploaderName(e.target.value)}
                          className="pl-10"
                          disabled={uploading}
                        />
                      </div>
                      <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                          placeholder="Secret Code (Optional)" 
                          value={secretCode}
                          onChange={(e) => setSecretCode(e.target.value)}
                          className="pl-10"
                          disabled={uploading}
                        />
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      className="bg-white hover:bg-gray-50 border-gray-300"
                      disabled={uploading}
                    >
                      Choose File
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        
                        <Button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Upload
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {uploading && (
                        <div className="mt-4">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-sm text-gray-600 mt-2">{uploadProgress}% uploaded</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}