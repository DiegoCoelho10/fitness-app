import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import { getTopStudents } from '../services/firebaseService'
import './Ranking.css'

export function Ranking() {
  const { user } = useAuthStore()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRanking = async () => {
      const topStudents = await getTopStudents(user.uid, 50)
      setStudents(topStudents)
      setLoading(false)
    }

    loadRanking()
  }, [user.uid])

  if (loading) {
    return <div className="ranking-loading">Carregando ranking...</div>
  }

  return (
    <div className="ranking-page">
      <div className="ranking-header">
        <h1>🏆 Ranking de Alunos</h1>
        <p>Veja os melhores desempenhos</p>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum aluno adicionado ainda</p>
        </div>
      ) : (
        <div className="ranking-container">
          {/* Top 3 Podium */}
          <div className="podium">
            {students[1] && (
              <div className="podium-item silver">
                <div className="medal">🥈</div>
                <img
                  src={students[1].profile?.photo || ''}
                  alt={students[1].name}
                  className="podium-photo"
                />
                <h3>{students[1].name}</h3>
                <div className="podium-points">{students[1].gamification?.points || 0} pts</div>
              </div>
            )}

            {students[0] && (
              <div className="podium-item gold">
                <div className="medal">🥇</div>
                <img
                  src={students[0].profile?.photo || ''}
                  alt={students[0].name}
                  className="podium-photo"
                />
                <h3>{students[0].name}</h3>
                <div className="podium-points">{students[0].gamification?.points || 0} pts</div>
              </div>
            )}

            {students[2] && (
              <div className="podium-item bronze">
                <div className="medal">🥉</div>
                <img
                  src={students[2].profile?.photo || ''}
                  alt={students[2].name}
                  className="podium-photo"
                />
                <h3>{students[2].name}</h3>
                <div className="podium-points">{students[2].gamification?.points || 0} pts</div>
              </div>
            )}
          </div>

          {/* Full Ranking List */}
          <div className="ranking-list">
            <div className="ranking-header-table">
              <div className="col-rank">Posição</div>
              <div className="col-name">Aluno</div>
              <div className="col-stat">Treinos</div>
              <div className="col-stat">Pontos</div>
              <div className="col-stat">Sequência</div>
            </div>

            {students.map((student, idx) => (
              <div key={student.id} className="ranking-item">
                <div className="col-rank">
                  <span className="rank-badge">#{idx + 1}</span>
                </div>

                <div className="col-name">
                  <div className="student-info-compact">
                    {student.profile?.photo ? (
                      <img src={student.profile.photo} alt={student.name} className="mini-avatar" />
                    ) : (
                      <div className="mini-avatar-placeholder">👤</div>
                    )}
                    <div className="name-info">
                      <p className="name">{student.name}</p>
                      <p className="goal">{student.goal || 'Sem objetivo'}</p>
                    </div>
                  </div>
                </div>

                <div className="col-stat">
                  <div className="stat-badge">
                    <span className="icon">💪</span>
                    {student.gamification?.totalWorkouts || 0}
                  </div>
                </div>

                <div className="col-stat">
                  <div className="stat-badge points">
                    <span className="icon">⭐</span>
                    {student.gamification?.points || 0}
                  </div>
                </div>

                <div className="col-stat">
                  <div className="stat-badge streak">
                    <span className="icon">🔥</span>
                    {student.gamification?.streak || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Badges Legend */}
          <div className="badges-legend">
            <h3>Conquistas Disponíveis</h3>
            <div className="badges-grid">
              <div className="badge-info">
                <span>🥇</span>
                <p>Primeiro Treino</p>
              </div>
              <div className="badge-info">
                <span>🔥</span>
                <p>Semana Consistente</p>
              </div>
              <div className="badge-info">
                <span>💪</span>
                <p>Mês de Sequência</p>
              </div>
              <div className="badge-info">
                <span>⭐</span>
                <p>Top Performer</p>
              </div>
              <div className="badge-info">
                <span>📸</span>
                <p>Photo Upload</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
