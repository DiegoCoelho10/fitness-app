import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import { getStudentsByTrainer, getWorkoutsByStudent } from '../services/firebaseService'
import { GamificationWidget } from '../components/GamificationWidget'
import './Dashboard.css'

export function Dashboard() {
  const { user, userRole } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    setLoading(true)

    if (userRole === 'personal_trainer') {
      // Admin vê stats e alunos
      getStudentsByTrainer(user.uid, (snapshot) => {
        const students = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        const stats = {
          totalStudents: students.length,
          activeToday: students.filter(s => {
            const lastCheckIn = s.gamification?.lastCheckIn
            return lastCheckIn === new Date().toDateString()
          }).length,
          totalPoints: students.reduce((sum, s) => sum + (s.gamification?.points || 0), 0),
          topStudent: students.length > 0 
            ? students.sort((a, b) => (b.gamification?.points || 0) - (a.gamification?.points || 0))[0]
            : null
        }

        setData({ students, stats })
        setLoading(false)
      })
    } else {
      // Aluno vê seu perfil e treinos
      getWorkoutsByStudent(user.uid, (snapshot) => {
        const workouts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        setData({ workouts })
        setLoading(false)
      })
    }
  }, [user, userRole])

  if (loading) {
    return <div className="dashboard-loading">Carregando...</div>
  }

  return (
    <div className="dashboard">
      {/* Header Premium */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Bem-vindo, {user?.displayName || user?.email?.split('@')[0]}! 👋</h1>
          <p>{userRole === 'personal_trainer' ? 'Painel do Personal Trainer' : 'Seu painel de aluno'}</p>
        </div>
      </div>

      {userRole === 'personal_trainer' ? (
        // ===== DASHBOARD ADMIN =====
        <div className="dashboard-content">
          {/* Stats Grid */}
          <div className="stats-grid premium">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{data?.stats?.totalStudents || 0}</div>
                <div className="stat-label">Alunos Total</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-value">{data?.stats?.activeToday || 0}</div>
                <div className="stat-label">Ativos Hoje</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">{data?.stats?.totalPoints || 0}</div>
                <div className="stat-label">Pontos Totais</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-info">
                <div className="stat-value">{data?.stats?.topStudent?.name || '-'}</div>
                <div className="stat-label">Melhor Aluno</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Ações Rápidas</h2>
            <div className="actions-grid">
              <a href="/students" className="action-btn new-student">
                <span className="action-icon">➕</span>
                <span className="action-label">Novo Aluno</span>
              </a>
              <a href="/workouts" className="action-btn new-workout">
                <span className="action-icon">💪</span>
                <span className="action-label">Novo Treino</span>
              </a>
              <a href="/ranking" className="action-btn ranking">
                <span className="action-icon">🏅</span>
                <span className="action-label">Ranking</span>
              </a>
            </div>
          </div>

          {/* Students List */}
          <div className="students-preview">
            <h2>Seus Alunos</h2>
            <div className="students-list">
              {data?.students?.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhum aluno adicionado ainda</p>
                  <a href="/students" className="btn-primary">Adicionar Aluno</a>
                </div>
              ) : (
                data?.students?.slice(0, 5).map(student => (
                  <div key={student.id} className="student-card">
                    <div className="student-header">
                      {student.profile?.photo ? (
                        <img src={student.profile.photo} alt={student.name} className="student-photo" />
                      ) : (
                        <div className="student-photo-placeholder">👤</div>
                      )}
                      <div className="student-info">
                        <h4>{student.name}</h4>
                        <p>{student.goal || 'Sem objetivo'}</p>
                      </div>
                    </div>
                    <div className="student-stats">
                      <div className="mini-stat">
                        <span className="icon">💪</span>
                        <span>{student.gamification?.totalWorkouts || 0}</span>
                      </div>
                      <div className="mini-stat">
                        <span className="icon">⭐</span>
                        <span>{student.gamification?.points || 0}</span>
                      </div>
                      <div className="mini-stat">
                        <span className="icon">🔥</span>
                        <span>{student.gamification?.streak || 0}</span>
                      </div>
                    </div>
                    <a href={`/chat/${student.id}`} className="btn-small">Chat</a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        // ===== DASHBOARD ALUNO =====
        <div className="dashboard-content">
          {/* Gamification Widget */}
          <GamificationWidget gamification={data?.workouts?.[0]?.gamification || {}} />

          {/* Next Workout */}
          <div className="next-workout-section">
            <h2>Próximo Treino</h2>
            {data?.workouts?.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum treino atribuído</p>
                <p className="text-muted">Aguarde seu personal trainer atribuir um treino</p>
              </div>
            ) : (
              <div className="workout-preview">
                <div className="workout-card">
                  <h3>{data?.workouts?.[0]?.name || 'Treino'}</h3>
                  <p className="workout-description">{data?.workouts?.[0]?.description || ''}</p>
                  
                  <div className="exercises-preview">
                    <h4>Exercícios ({data?.workouts?.[0]?.exercises?.length || 0})</h4>
                    {data?.workouts?.[0]?.exercises?.slice(0, 3).map((ex, idx) => (
                      <div key={idx} className="exercise-item">
                        <span>{ex.name} - {ex.sets}x{ex.reps}</span>
                      </div>
                    ))}
                  </div>

                  <a href={`/workout/${data?.workouts?.[0]?.id}`} className="btn-primary btn-large">
                    Fazer Treino Agora
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Recent Workouts */}
          {data?.workouts?.length > 0 && (
            <div className="recent-section">
              <h2>Histórico</h2>
              <div className="workouts-history">
                {data?.workouts?.slice(0, 5).map(workout => (
                  <div key={workout.id} className="history-item">
                    <div className="history-icon">💪</div>
                    <div className="history-content">
                      <h4>{workout.name}</h4>
                      <p>{workout.completed?.length || 0} vezes completado</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
