import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiTarget,
  FiTrendingUp,
  FiCreditCard,
  FiSettings,
  FiLogOut,
} from 'react-icons/fi'
import { useAuthStore } from '../context/authStore'
import './Sidebar.css'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, userRole, logout } = useAuthStore()

  const isPersonal = userRole === 'personal_trainer'

  const menuItems = isPersonal
    ? [
        { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
        { icon: FiUsers, label: 'Alunos', path: '/students' },
        { icon: FiTarget, label: 'Treinos', path: '/workouts' },
        { icon: FiTrendingUp, label: 'Ranking', path: '/ranking' },
        { icon: FiCreditCard, label: 'Financeiro', path: '/finance' },
      ]
    : [
        { icon: FiHome, label: 'Meu Treino', path: '/my-workout' },
        { icon: FiTarget, label: 'Check-in', path: '/checkin' },
        { icon: FiTrendingUp, label: 'Ranking', path: '/ranking' },
        { icon: FiUsers, label: 'Progresso', path: '/progress' },
      ]

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      {/* Botão de menu para mobile */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        className={`sidebar ${isOpen ? 'open' : ''}`}
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header do Sidebar */}
        <div className="sidebar-header">
          <h2>FIT</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="sidebar-close"
            aria-label="Close menu"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Logo/Profile */}
        <div className="sidebar-profile">
          <div className="profile-avatar">{user?.email?.[0].toUpperCase()}</div>
          <div className="profile-info">
            <h3>{user?.displayName || 'Usuário'}</h3>
            <p>{isPersonal ? 'Personal Trainer' : 'Aluno'}</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <li key={item.path}>
                  <motion.button
                    onClick={() => {
                      navigate(item.path)
                      setIsOpen(false)
                    }}
                    className={`nav-item ${active ? 'active' : ''}`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                    {active && <div className="nav-indicator" />}
                  </motion.button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button
            onClick={() => navigate('/settings')}
            className="nav-item"
          >
            <FiSettings size={20} />
            <span>Configurações</span>
          </button>
          <button onClick={handleLogout} className="nav-item logout">
            <FiLogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </motion.div>
    </>
  )
}
