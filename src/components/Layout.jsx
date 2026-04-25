import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { Sidebar } from './Sidebar'
import './Layout.css'

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="layout-main">
        <header className="layout-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ≡
          </button>
          <h1>FIT APP</h1>
          <button className="logout-btn" onClick={handleLogout}>
            Sair
          </button>
        </header>

        <main className="layout-content">
          {children}
        </main>
      </div>
    </div>
  )
}
