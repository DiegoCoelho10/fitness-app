import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../context/authStore'
import './Dashboard.css'

export function Dashboard() {
  const { user, userRole } = useAuthStore()
  const [stats, setStats] = useState({
    activeStudents: 24,
    weeklyRevenue: 2840,
    totalPoints: 3890,
    currentStreak: 8,
  })

  const isPersonal = userRole === 'personal_trainer'

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1>Bem-vindo, {user?.displayName || user?.email?.split('@')[0]}!</h1>
          <p>{isPersonal ? 'Painel do Personal Trainer' : 'Seu painel de aluno'}</p>
        </div>
      </motion.div>

      {/* Cards de Estatísticas */}
      <motion.div
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isPersonal ? (
          <>
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="stat-label">Alunos Ativos</div>
              <div className="stat-value">{stats.activeStudents}</div>
              <div className="stat-change positive">+3 esta semana</div>
            </motion.div>
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="stat-label">Receita Semanal</div>
              <div className="stat-value">R$ {stats.weeklyRevenue.toLocaleString('pt-BR')}</div>
              <div className="stat-change positive">+12 assinaturas</div>
            </motion.div>
          </>
        ) : (
          <>
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="stat-label">Seus Pontos</div>
              <div className="stat-value">{stats.totalPoints.toLocaleString('pt-BR')}</div>
              <div className="stat-change positive">+150 hoje</div>
            </motion.div>
            <motion.div className="stat-card" variants={itemVariants}>
              <div className="stat-label">🔥 Streak</div>
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-change positive">dias seguidos</div>
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Seção de Ações Rápidas */}
      <motion.div
        className="quick-actions"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2>Ações Rápidas</h2>
        <div className="actions-grid">
          {isPersonal ? (
            <>
              <motion.button
                className="action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">👥</div>
                <div className="action-label">Novo Aluno</div>
              </motion.button>
              <motion.button
                className="action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">💪</div>
                <div className="action-label">Novo Treino</div>
              </motion.button>
              <motion.button
                className="action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">📊</div>
                <div className="action-label">Relatórios</div>
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                className="action-btn primary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">✅</div>
                <div className="action-label">Check-in</div>
              </motion.button>
              <motion.button
                className="action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">💪</div>
                <div className="action-label">Meu Treino</div>
              </motion.button>
              <motion.button
                className="action-btn"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="action-icon">📈</div>
                <div className="action-label">Progresso</div>
              </motion.button>
            </>
          )}
        </div>
      </motion.div>

      {/* Seção de Ranking Preview */}
      <motion.div
        className="ranking-preview"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="section-header">
          <h2>🏆 Top Alunos</h2>
          <a href="/ranking" className="view-all">Ver tudo →</a>
        </div>
        <div className="ranking-list">
          {[
            { name: 'João Silva', points: 4250, streak: 12, medal: '🥇' },
            { name: 'Marina Costa', points: 3890, streak: 8, medal: '🥈' },
            { name: 'Pedro Costa', points: 3420, streak: 5, medal: '🥉' },
          ].map((student, idx) => (
            <motion.div
              key={idx}
              className="ranking-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + idx * 0.1 }}
            >
              <span className="medal">{student.medal}</span>
              <div className="student-info">
                <p className="student-name">{student.name}</p>
                <p className="student-meta">🔥 {student.streak} dias</p>
              </div>
              <span className="points">{student.points.toLocaleString('pt-BR')} pts</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
