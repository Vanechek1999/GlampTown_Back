import { Routes, Route } from 'react-router-dom'
import { HomePage, ListingPage, Promotion } from './pages'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/listings/:id" element={<ListingPage />} />
      <Route path="/promotion" element={<Promotion />} />
    </Routes>
  )
}

export default App
