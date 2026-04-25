import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Sidebar.css'

export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()

  const handleNavClick = (path) => {
    navigate(path)
    onClose()
  }

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Menu</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <ul className="sidebar-menu">
          <li>
            <button onClick={() => handleNavClick('/dashboard')}>
              📊 Dashboard
            </button>
          </li>
          <li>
            <button onClick={() => handleNavClick('/students')}>
              👥 Alunos
            </button>
          </li>
          <li>
            <button onClick={() => handleNavClick('/workouts')}>
              💪 Treinos
            </button>
          </li>
          <li>
            <button onClick={() => handleNavClick('/ranking')}>
              🏆 Ranking
            </button>
          </li>
        </ul>
      </nav>
    </>
  )
}
