import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import { getAlunosByTrainer, getAluno, getPersonalTrainer } from '../services/firebaseService'
import { GamificationWidget } from '../components/GamificationWidget'
import './Dashboard.css'

export function Dashboard() {
  const { user, userRole } = useAuthStore()
  const [personalTrainer, setPersonalTrainer] = useState(null)
  const [alunos, setAlunos] = useState([])
  const [alunoProfile, setAlunoProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    setLoading(true)

    if (userRole === 'personal_trainer') {
      // Carrega PT e alunos
      const loadPT = async () => {
        try {
          const pt = await getPersonalTrainer(user.uid)
          setPersonalTrainer(pt)
        } catch (error) {
          console.error('Erro ao carregar PT:', error)
        }
      }

      loadPT()

      const unsubscribe = getAlunosByTrainer(user.uid, (alunosData) => {
        setAlunos(alunosData)
        setLoading(false)
      })

      return unsubscribe
    } else {
      // Carrega perfil do aluno
      const loadAluno = async () => {
        try {
          const aluno = await getAluno(user.uid)
          setAlunoProfile(aluno)
        } catch (error) {
          console.error('Erro ao carregar aluno:', error)
        } finally {
          setLoading(false)
        }
      }

      loadAluno()
    }
  }, [user, userRole])

  if (loading) {
    return <div className="dashboard-loading">Carregando...</div>
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Bem-vindo, {personalTrainer?.name || alunoProfile?.name || user?.email?.split('@')[0]}! 👋</h1>
          <p>{userRole === 'personal_trainer' ? 'Painel do Personal Trainer' : 'Seu painel de aluno'}</p>
        </div>
      </div>

      {userRole === 'personal_trainer' ? (
        // ===== DASHBOARD PT =====
        <div className="dashboard-content">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-value">{alunos.length}</div>
                <div className="stat-label">Alunos</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💪</div>
              <div className="stat-info">
                <div className="stat-value">
                  {alunos.reduce((sum, a) => sum + (a.gamification?.totalWorkouts || 0), 0)}
                </div>
                <div className="stat-label">Treinos Completos</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <div className="stat-info">
                <div className="stat-value">
                  {alunos.reduce((sum, a) => sum + (a.gamification?.totalPoints || 0), 0)}
                </div>
                <div className="stat-label">Pontos Totais</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔥</div>
              <div className="stat-info">
                <div className="stat-value">
                  {Math.max(0, ...alunos.map(a => a.gamification?.streak || 0))}
                </div>
                <div className="stat-label">Maior Streak</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Ações Rápidas</h2>
            <div className="actions-grid">
              <a href="/students" className="action-btn">
                <span className="action-icon">➕</span>
                <span className="action-label">Novo Aluno</span>
              </a>
              <a href="/ranking" className="action-btn">
                <span className="action-icon">🏆</span>
                <span className="action-label">Ranking</span>
              </a>
              <a href="/profile" className="action-btn">
                <span className="action-icon">⚙️</span>
                <span className="action-label">Meu Perfil</span>
              </a>
            </div>
          </div>

          {/* Alunos List */}
          <div className="alunos-section">
            <h2>Seus Alunos</h2>
            {alunos.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum aluno adicionado ainda</p>
                <a href="/students" className="btn-primary">Adicionar Aluno</a>
              </div>
            ) : (
              <div className="alunos-grid">
                {alunos.map(aluno => (
                  <div key={aluno.id} className="aluno-card">
                    <div className="card-header">
                      {aluno.profilePhoto ? (
                        <img src={aluno.profilePhoto} alt={aluno.name} className="aluno-photo" />
                      ) : (
                        <div className="photo-placeholder">👤</div>
                      )}
                    </div>

                    <div className="card-body">
                      <h3>{aluno.name}</h3>
                      <p className="goal">{aluno.goal || 'Sem objetivo'}</p>

                      <div className="aluno-stats">
                        <div className="mini-stat">
                          <span>💪</span>
                          <span>{aluno.gamification?.totalWorkouts || 0}</span>
                        </div>
                        <div className="mini-stat">
                          <span>⭐</span>
                          <span>{aluno.gamification?.totalPoints || 0}</span>
                        </div>
                        <div className="mini-stat">
                          <span>🔥</span>
                          <span>{aluno.gamification?.streak || 0}</span>
                        </div>
                      </div>

                      <a href={`/chat/${aluno.id}`} className="btn-chat">
                        💬 Chat
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // ===== DASHBOARD ALUNO =====
        <div className="dashboard-content">
          {alunoProfile && <GamificationWidget gamification={alunoProfile.gamification || {}} />}

          <div className="aluno-info-section">
            <h2>Suas Informações</h2>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Objetivo</span>
                <p>{alunoProfile?.goal || 'Não definido'}</p>
              </div>
              <div className="info-item">
                <span className="label">Altura</span>
                <p>{alunoProfile?.measurements?.height || '-'} cm</p>
              </div>
              <div className="info-item">
                <span className="label">Peso</span>
                <p>{alunoProfile?.measurements?.weight || '-'} kg</p>
              </div>
              <div className="info-item">
                <span className="label">Data de Nascimento</span>
                <p>{alunoProfile?.dateOfBirth || '-'}</p>
              </div>
            </div>
          </div>

          <div className="action-section">
            <a href="/profile" className="btn-primary">
              Editar Perfil
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
