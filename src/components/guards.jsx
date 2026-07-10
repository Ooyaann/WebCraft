'use client';
// Port guard autentikasi dari frontend/src/App.jsx.
import { useStore } from '../store/useStore';
import { Navigate } from '../lib/router-compat';

function SessionSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E0F2FE]">
      <div className="flex flex-col items-center gap-3">
        <div className="neo-spinner" />
        <p className="font-fredoka font-bold text-slate-700 text-sm">Memulihkan Sesi...</p>
      </div>
    </div>
  );
}

export function RequireAuth({ children }) {
  const { user } = useStore();
  const token = localStorage.getItem('webcraft_token');
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }
  if (!user) {
    return <SessionSpinner />;
  }
  return children;
}

export function RequireRole({ role, children }) {
  const { user } = useStore();
  const token = localStorage.getItem('webcraft_token');
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }
  if (!user) {
    return <SessionSpinner />;
  }
  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return children;
}
