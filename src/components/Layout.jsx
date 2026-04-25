import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { Sidebar } from './Sidebar'
import { NotificationCenter } from '../components/NotificationCenter'
import './Layout.css'

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, userRole, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="layout-main">
        {/* Header */}
        <header className="layout-header">
          <div className="header-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="logo">FIT</div>
          </div>

          <div className="header-right">
            <NotificationCenter userId={user?.uid} />
            
            <div className="user-menu">
              <button
                className="user-avatar-btn"
                onClick={() => navigate('/profile')}
                title={user?.email}
              >
                👤
              </button>
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
              title="Sair"
            >
              🚪
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="layout-content">
          {children}
        </main>

        {/* Footer */}
        <footer className="layout-footer">
          <p>© 2024 FIT - Seu App de Treino com Gamificação</p>
          <p>Versão 1.0.0</p>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  )
}
