import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import SessionPage from './pages/SessionPage'
import SubmissionPage from './pages/SubmissionPage'
import PresentationPage from './pages/PresentationPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SessionPage />} />
        <Route path="/share/:sessionCode" element={<SubmissionPage />} />
        <Route path="/share/:sessionCode/present" element={<PresentationPage />} />
      </Routes>
    </Router>
  )
}

export default App
