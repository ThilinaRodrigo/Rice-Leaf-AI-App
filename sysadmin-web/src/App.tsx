import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { UsersManager } from './pages/UsersManager';
import { ScansManager } from './pages/ScansManager';
import { ProductsManager } from './pages/ProductsManager';
import { DiseasesManager } from './pages/DiseasesManager';
import { AdsManager } from './pages/AdsManager';
import { PostsManager } from './pages/PostsManager';

const ProtectedLayout: React.FC = () => {
  const { user, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-semibold">Authenticating Admin Session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'sys_admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<UsersManager />} />
            <Route path="/scans" element={<ScansManager />} />
            <Route path="/ads" element={<AdsManager />} />
            <Route path="/posts" element={<PostsManager />} />
            <Route path="/products" element={<ProductsManager />} />
            <Route path="/diseases" element={<DiseasesManager />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}

export default App;
