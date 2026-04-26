import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { NotificationCenter } from './NotificationCenter'
import './Layout.css'

export function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { userRole, logout } = useAuthStore()

  const handleLogout = () => {
    if (window.confirm('Tem certeza que deseja sair?')) {
      logout()
      navigate('/login')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout">
      {/* Header */}
      <header className="layout-header">
        <div className="header-content">
          <Link to="/dashboard" className="logo">
            <span className="logo-icon">💪</span>
            <span className="logo-text">FITNESS</span>
          </Link>

          <nav className="header-nav">
            {userRole === 'personal_trainer' ? (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/students"
                  className={`nav-link ${isActive('/students') ? 'active' : ''}`}
                >
                  Alunos
                </Link>
                <Link
                  to="/ranking"
                  className={`nav-link ${isActive('/ranking') ? 'active' : ''}`}
                >
                  Ranking
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Meu Treino
                </Link>
              </>
            )}
          </nav>

          <div className="header-actions">
            <NotificationCenter />
            <Link to="/profile" className="header-avatar">
              👤
            </Link>
            <button onClick={handleLogout} className="btn-logout">
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="layout-main">
        {children}
      </main>

      {/* Footer */}
      <footer className="layout-footer">
        <p>&copy; 2026 Fitness App. Todos os direitos reservados.</p>
      </footer>
    </div>
  )
}
