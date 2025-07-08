import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Upload } from './pages/Upload'
import { FileView } from './pages/FileView'
import { Toaster } from 'react-hot-toast'

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
        <Routes>
          <Route path="/" element={<Upload />} />
          <Route path="/file/:fileId" element={<FileView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App