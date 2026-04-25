import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import './Sidebar.css'

export function Sidebar({ isOpen, onClose }) {
  const { userRole } = useAuthStore()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  const adminMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', exact: true },
    { path: '/students', icon: '👥', label: 'Alunos' },
    { path: '/workouts', icon: '💪', label: 'Treinos' },
    { path: '/ranking', icon: '🏆', label: 'Ranking' },
    { path: '/profile', icon: '⚙️', label: 'Perfil' },
  ]

  const studentMenuItems = [
    { path: '/dashboard', icon: '📊', label: 'Home', exact: true },
    { path: '/profile', icon: '👤', label: 'Meu Perfil' },
  ]

  const menuItems = userRole === 'personal_trainer' ? adminMenuItems : studentMenuItems

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>FIT</h1>
          <p className="sidebar-role">
            {userRole === 'personal_trainer' ? '💼 Trainer' : '💪 Aluno'}
          </p>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-menu">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="footer-info">
            <p className="footer-text">
              {userRole === 'personal_trainer'
                ? 'Gerencie seus alunos e treinos'
                : 'Acompanhe seu progresso'}
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
