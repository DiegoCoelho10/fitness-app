import React, { useState } from 'react'
import { useAuthStore } from '../context/authStore'
import './Dashboard.css'

export function Dashboard() {
  const { user, userRole } = useAuthStore()
  const [stats] = useState({
    activeStudents: 24,
    weeklyRevenue: 2840,
    totalPoints: 3890,
    currentStreak: 8,
  })

  const isPersonal = userRole === 'personal_trainer'

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Bem-vindo, {user?.displayName || user?.email?.split('@')[0]}!</h1>
          <p>{isPersonal ? 'Painel do Personal Trainer' : 'Seu painel de aluno'}</p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid">
        {isPersonal ? (
          <>
            <div className="stat-card">
              <div className="stat-label">Alunos Ativos</div>
              <div className="stat-value">{stats.activeStudents}</div>
              <div className="stat-change positive">+3 esta semana</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Receita Semanal</div>
              <div className="stat-value">R$ {stats.weeklyRevenue.toLocaleString('pt-BR')}</div>
              <div className="stat-change positive">+12 assinaturas</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-label">Seus Pontos</div>
              <div className="stat-value">{stats.totalPoints.toLocaleString('pt-BR')}</div>
              <div className="stat-change positive">+150 hoje</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">🔥 Streak</div>
              <div className="stat-value">{stats.currentStreak}</div>
              <div className="stat-change positive">dias seguidos</div>
            </div>
          </>
        )}
      </div>

      {/* Seção de Ações Rápidas */}
      <div className="quick-actions">
        <h2>Ações Rápidas</h2>
        <div className="actions-grid">
          {isPersonal ? (
            <>
              <button className="action-btn">
                <div className="action-icon">👥</div>
                <div className="action-label">Novo Aluno</div>
              </button>
              <button className="action-btn">
                <div className="action-icon">💪</div>
                <div className="action-label">Novo Treino</div>
              </button>
              <button className="action-btn">
                <div className="action-icon">📊</div>
                <div className="action-label">Relatórios</div>
              </button>
            </>
          ) : (
            <>
              <button className="action-btn primary">
                <div className="action-icon">✅</div>
                <div className="action-label">Check-in</div>
              </button>
              <button className="action-btn">
                <div className="action-icon">💪</div>
                <div className="action-label">Meu Treino</div>
              </button>
              <button className="action-btn">
                <div className="action-icon">📈</div>
                <div className="action-label">Progresso</div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Seção de Ranking Preview */}
      <div className="ranking-preview">
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
            <div key={idx} className="ranking-item">
              <span className="medal">{student.medal}</span>
              <div className="student-info">
                <p className="student-name">{student.name}</p>
                <p className="student-meta">🔥 {student.streak} dias</p>
              </div>
              <span className="points">{student.points.toLocaleString('pt-BR')} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
