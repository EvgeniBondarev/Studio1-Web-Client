import { Routes, Route } from 'react-router-dom'
import AdminApp from './AdminApp.tsx';
import {PublicPartInfoPage} from './components/PublicPartInfoPage.tsx';

export default function App() {
  return (
    <Routes>
      <Route path="/info" element={<PublicPartInfoPage />} />
      <Route path="*" element={<AdminApp />} />
    </Routes>
  )
}

