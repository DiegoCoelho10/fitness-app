import React from 'react'
import './GamificationWidget.css'

const BADGES = {
  first_workout: { icon: '🥇', name: 'Primeiro Treino', desc: 'Completou seu primeiro treino' },
  week_7: { icon: '🔥', name: '7 Dias de Fogo', desc: '7 dias consecutivos' },
  month_30: { icon: '💪', name: '30 Dias Consistente', desc: '30 dias consecutivos' },
  top_performer: { icon: '⭐', name: 'Top Performer', desc: 'Entre os top 3' },
  photo_master: { icon: '📸', name: 'Photo Master', desc: '10 fotos de progresso' }
}

export function GamificationWidget({ gamification = {} }) {
  const points = gamification.totalPoints || 0
  const streak = gamification.streak || 0
  const workouts = gamification.totalWorkouts || 0
  const badges = gamification.badges || []

  const getLevel = (points) => {
    if (points < 500) return { name: 'Novato', color: '#999', icon: '⚪' }
    if (points < 1500) return { name: 'Guerreiro', color: '#E07800', icon: '🟠' }
    if (points < 3000) return { name: 'Lendário', color: '#FFD700', icon: '🟡' }
    return { name: 'Supremo', color: '#E91E63', icon: '🔴' }
  }

  const level = getLevel(points)
  const nextLevelThreshold = [500, 1500, 3000, Infinity]
  const currentThreshold = nextLevelThreshold.filter(t => t > points)[0]
  const prevThreshold = nextLevelThreshold.filter(t => t <= points).pop()
  const progress = ((points - prevThreshold) / (currentThreshold - prevThreshold)) * 100

  return (
    <div className="gamification-widget">
      {/* Header */}
      <div className="gamif-header">
        <h2>🎮 Seu Progresso</h2>
      </div>

      {/* Level Card */}
      <div className="level-card">
        <div className="level-display">
          <div className="level-icon">{level.icon}</div>
          <div className="level-info">
            <p className="level-name">{level.name}</p>
            <p className="level-points">{points} pontos</p>
          </div>
        </div>

        <div className="level-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="progress-text">Próximo nível: {currentThreshold} pts</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <p className="stat-value">{workouts}</p>
            <p className="stat-label">Treinos</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <p className="stat-value">{streak}</p>
            <p className="stat-label">Dias Fogo</p>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <p className="stat-value">{points}</p>
            <p className="stat-label">Pontos</p>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="badges-section">
        <h3>🏅 Suas Conquistas</h3>
        <div className="badges-list">
          {Object.entries(BADGES).map(([id, badge]) => (
            <div
              key={id}
              className={`badge ${badges.includes(id) ? 'unlocked' : 'locked'}`}
              title={badge.desc}
            >
              <span className="badge-icon">{badge.icon}</span>
              <span className="badge-name">{badge.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Motivation */}
      <div className="motivation-section">
        <p className="motivation-text">
          {streak > 0
            ? `🔥 Você está em ${streak} dias! Continue assim!`
            : streak === 0 && workouts > 0
            ? '💪 Volte amanhã para continuar sua sequência!'
            : '🎯 Comece seu primeiro treino hoje!'}
        </p>
      </div>
    </div>
  )
}
