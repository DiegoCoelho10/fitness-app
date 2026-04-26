import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import { subscribeToRanking } from '../services/firebaseService'
import './Ranking.css'

export function Ranking() {
  const { user, userRole } = useAuthStore()
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)
  const [userRank, setUserRank] = useState(null)

  useEffect(() => {
    if (!user || userRole !== 'personal_trainer') {
      setLoading(false)
      return
    }

    const unsubscribe = subscribeToRanking(user.uid, (alunosData) => {
      setRanking(alunosData)
      setLoading(false)
    })

    return unsubscribe
  }, [user, userRole])

  if (userRole !== 'personal_trainer') {
    return (
      <div className="ranking-page">
        <div className="empty-state">
          <p>Apenas personal trainers podem ver o ranking</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="ranking-loading">Carregando ranking...</div>
  }

  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <h1>🏆 Ranking de Alunos</h1>
        <p>Veja os melhores desempenhos da sua turma</p>
      </div>

      {ranking.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum aluno adicionado ainda</p>
        </div>
      ) : (
        <div className="ranking-container">
          {/* Top 3 Podium */}
          {ranking.length >= 3 && (
            <div className="podium">
              {ranking[1] && (
                <div className="podium-item silver">
                  <div className="medal">🥈</div>
                  <img
                    src={ranking[1].profilePhoto || '/placeholder.jpg'}
                    alt={ranking[1].name}
                    className="podium-photo"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <div className="podium-placeholder">👤</div>
                  <h3>{ranking[1].name}</h3>
                  <div className="podium-points">{ranking[1].gamification?.totalPoints || 0} pts</div>
                </div>
              )}

              {ranking[0] && (
                <div className="podium-item gold">
                  <div className="medal">🥇</div>
                  <img
                    src={ranking[0].profilePhoto || '/placeholder.jpg'}
                    alt={ranking[0].name}
                    className="podium-photo"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <div className="podium-placeholder">👤</div>
                  <h3>{ranking[0].name}</h3>
                  <div className="podium-points">{ranking[0].gamification?.totalPoints || 0} pts</div>
                </div>
              )}

              {ranking[2] && (
                <div className="podium-item bronze">
                  <div className="medal">🥉</div>
                  <img
                    src={ranking[2].profilePhoto || '/placeholder.jpg'}
                    alt={ranking[2].name}
                    className="podium-photo"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                  <div className="podium-placeholder">👤</div>
                  <h3>{ranking[2].name}</h3>
                  <div className="podium-points">{ranking[2].gamification?.totalPoints || 0} pts</div>
                </div>
              )}
            </div>
          )}

          {/* Full Ranking List */}
          <div className="ranking-list">
            <div className="ranking-header-table">
              <div className="col-rank">Posição</div>
              <div className="col-name">Aluno</div>
              <div className="col-stat">Treinos</div>
              <div className="col-stat">Pontos</div>
              <div className="col-stat">Sequência</div>
            </div>

            {ranking.map((aluno, idx) => (
              <div key={aluno.id} className="ranking-item">
                <div className="col-rank">
                  <span className="rank-badge">#{idx + 1}</span>
                </div>

                <div className="col-name">
                  <div className="student-info">
                    {aluno.profilePhoto ? (
                      <img src={aluno.profilePhoto} alt={aluno.name} className="mini-avatar" />
                    ) : (
                      <div className="mini-avatar-placeholder">👤</div>
                    )}
                    <div className="name-info">
                      <p className="name">{aluno.name}</p>
                      <p className="goal">{aluno.goal || 'Sem objetivo'}</p>
                    </div>
                  </div>
                </div>

                <div className="col-stat">
                  <div className="stat-badge">
                    <span>💪</span>
                    {aluno.gamification?.totalWorkouts || 0}
                  </div>
                </div>

                <div className="col-stat">
                  <div className="stat-badge points">
                    <span>⭐</span>
                    {aluno.gamification?.totalPoints || 0}
                  </div>
                </div>

                <div className="col-stat">
                  <div className="stat-badge streak">
                    <span>🔥</span>
                    {aluno.gamification?.streak || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Badges Legend */}
          <div className="badges-legend">
            <h3>🏅 Badges Disponíveis</h3>
            <div className="badges-grid">
              <div className="badge-info">
                <span>🥇</span>
                <p>Primeiro Treino</p>
              </div>
              <div className="badge-info">
                <span>🔥</span>
                <p>7 Dias de Fogo</p>
              </div>
              <div className="badge-info">
                <span>💪</span>
                <p>30 Dias Consistente</p>
              </div>
              <div className="badge-info">
                <span>⭐</span>
                <p>Top Performer</p>
              </div>
              <div className="badge-info">
                <span>📸</span>
                <p>Foto de Progresso</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
