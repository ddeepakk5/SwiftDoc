import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ConfigPage from './components/ConfigPage';
import Editor from './components/Editor';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/create" element={<PrivateRoute><ConfigPage /></PrivateRoute>} />
          <Route path="/editor/:id" element={<PrivateRoute><Editor /></PrivateRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}