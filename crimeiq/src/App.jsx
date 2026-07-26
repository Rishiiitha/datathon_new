import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Sidebar from './components/Sidebar/Sidebar'
import LoginPage       from './pages/Login/LoginPage'
import DashboardPage   from './pages/Dashboard/DashboardPage'
import ChatPage        from './pages/Chat/ChatPage'
import NetworkPage     from './pages/Network/NetworkPage'
import AnalyticsPage   from './pages/Analytics/AnalyticsPage'
import CasesPage       from './pages/Cases/CasesPage'
import CaseDetailPage  from './pages/Cases/CaseDetailPage'
import AccusedProfilePage from './pages/AccusedProfile/AccusedProfilePage'
import ForecastingPage from './pages/Forecasting/ForecastingPage'
import FinancialPage   from './pages/Financial/FinancialPage'
import SociologicalPage from './pages/Sociological/SociologicalPage'
import AdminPage       from './pages/Admin/AdminPage'

function ProtectedLayout({ children }) {
  const { isAuthenticated } = useAuthStore()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => !v)} />
      <main className={`main-content${sidebarCollapsed ? ' collapsed' : ''}`}>
        {children}
      </main>
    </div>
  )
}

function AdminGuard({ children }) {
  const { role } = useAuthStore()
  if (role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  const base = window.location.pathname.startsWith('/app') ? '/app' : '/'
  return (
    <BrowserRouter basename={base}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          <ProtectedLayout><DashboardPage /></ProtectedLayout>
        } />
        <Route path="/chat" element={
          <ProtectedLayout><ChatPage /></ProtectedLayout>
        } />
        <Route path="/network" element={
          <ProtectedLayout><NetworkPage /></ProtectedLayout>
        } />
        <Route path="/analytics" element={
          <ProtectedLayout><AnalyticsPage /></ProtectedLayout>
        } />
        <Route path="/cases" element={
          <ProtectedLayout><CasesPage /></ProtectedLayout>
        } />
        <Route path="/cases/:id" element={
          <ProtectedLayout><CaseDetailPage /></ProtectedLayout>
        } />
        <Route path="/accused/:id" element={
          <ProtectedLayout><AccusedProfilePage /></ProtectedLayout>
        } />
        <Route path="/accused" element={
          <ProtectedLayout><AccusedProfilePage /></ProtectedLayout>
        } />
        <Route path="/forecasting" element={
          <ProtectedLayout><ForecastingPage /></ProtectedLayout>
        } />
        <Route path="/financial" element={
          <ProtectedLayout><FinancialPage /></ProtectedLayout>
        } />
        <Route path="/sociological" element={
          <ProtectedLayout><SociologicalPage /></ProtectedLayout>
        } />
        <Route path="/admin" element={
          <ProtectedLayout>
            <AdminGuard><AdminPage /></AdminGuard>
          </ProtectedLayout>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
