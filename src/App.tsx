import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { Upload } from './pages/Upload'
import { FileView } from './pages/FileView'
import { FolderView } from './pages/FolderView'
import { SecretCodeSearch } from './pages/SecretCodeSearch'
import { Toaster } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { blink } from '@/blink/client'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-2 flex justify-end space-x-2">
            <Button asChild variant="ghost">
              <Link to="/secret-code-search">Search by Code</Link>
            </Button>
            <Button variant="outline" onClick={() => blink.auth.login()}>
              Create Account
            </Button>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/file/:fileId" element={<FileView />} />
          <Route path="/folder/:folderId" element={<FolderView />} />
          <Route path="/secret-code-search" element={<SecretCodeSearch />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App