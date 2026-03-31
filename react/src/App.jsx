import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './assets/css/login.css';
import './assets/css/tailwind.css';
import Home     from './pages/Home';
import Login    from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}