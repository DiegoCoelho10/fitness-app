import React from 'react'
import './GamificationWidget.css'

export function GamificationWidget({ gamification = {} }) {
  const { points = 0, streak = 0, badges = [], totalWorkouts = 0 } = gamification

  const getBadgeIcon = (badge) => {
    const icons = {
      first_workout: '🥇',
      week_streak: '🔥',
      month_consistency: '💪',
      top_performer: '⭐',
      photo_upload: '📸',
      default: '🏆'
    }
    return icons[badge] || icons.default
  }

  return (
    <div className="gamification-widget">
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-value">{points}</div>
          <div className="stat-label">Pontos</div>
          <div className="stat-icon">⭐</div>
        </div>

        <div className="stat-item">
          <div className="stat-value">{streak}</div>
          <div className="stat-label">Sequência</div>
          <div className="stat-icon">🔥</div>
        </div>

        <div className="stat-item">
          <div className="stat-value">{totalWorkouts}</div>
          <div className="stat-label">Treinos</div>
          <div className="stat-icon">💪</div>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="badges-section">
          <h4>Conquistas</h4>
          <div className="badges-list">
            {badges.map((badge, idx) => (
              <div key={idx} className="badge-item" title={badge}>
                {getBadgeIcon(badge)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="progress-section">
        <div className="progress-label">Próximo nível em</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(points % 100)}%` }}></div>
        </div>
        <div className="progress-text">{points % 100}/100 pontos</div>
      </div>
    </div>
  )
}
