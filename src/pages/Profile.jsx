import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import { getStudent, updateStudent } from '../services/firebaseService'
import { PhotoUpload } from '../components/PhotoUpload'
import { GamificationWidget } from '../components/GamificationWidget'
import './Profile.css'

export function Profile() {
  const { user, userRole } = useAuthStore()
  const [student, setStudent] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    level: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userRole === 'student' && user?.uid) {
      getStudent(user.uid).then(data => {
        setStudent(data)
        setFormData({
          name: data?.name || '',
          goal: data?.goal || '',
          level: data?.level || ''
        })
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [user, userRole])

  const handlePhotoUploaded = (url) => {
    setStudent({
      ...student,
      profile: { ...student?.profile, photo: url }
    })
  }

  const handleSaveProfile = async () => {
    if (userRole === 'student' && student?.id) {
      await updateStudent(student.id, formData)
      setStudent({ ...student, ...formData })
      setEditing(false)
    }
  }

  if (loading) {
    return <div className="profile-loading">Carregando perfil...</div>
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Cover */}
        <div className="profile-cover"></div>

        {/* Avatar & Basic Info */}
        <div className="profile-header">
          <div className="avatar-section">
            {student?.profile?.photo ? (
              <img src={student.profile.photo} alt={student?.name} className="profile-avatar" />
            ) : (
              <div className="avatar-placeholder-large">👤</div>
            )}
            {userRole === 'student' && (
              <PhotoUpload userId={user.uid} onPhotoUploaded={handlePhotoUploaded} />
            )}
          </div>

          <div className="profile-info">
            <h1>{student?.name || user?.email}</h1>
            <p className="role-badge">
              {userRole === 'student' ? 'Aluno' : 'Personal Trainer'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="profile-content">
          {userRole === 'student' && student ? (
            <>
              {/* Gamification */}
              <div className="profile-section">
                <GamificationWidget gamification={student.gamification || {}} />
              </div>

              {/* Profile Info */}
              <div className="profile-section">
                <div className="section-header">
                  <h2>Informações</h2>
                  <button
                    onClick={() => setEditing(!editing)}
                    className="btn-edit-profile"
                  >
                    {editing ? '✕ Cancelar' : '✏️ Editar'}
                  </button>
                </div>

                {editing ? (
                  <form className="profile-form">
                    <div className="form-group">
                      <label>Nome</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>

                    <div className="form-group">
                      <label>Objetivo</label>
                      <input
                        type="text"
                        value={formData.goal}
                        onChange={(e) => setFormData({...formData, goal: e.target.value})}
                        placeholder="Ex: Ganhar massa"
                      />
                    </div>

                    <div className="form-group">
                      <label>Nível</label>
                      <select
                        value={formData.level}
                        onChange={(e) => setFormData({...formData, level: e.target.value})}
                      >
                        <option value="iniciante">Iniciante</option>
                        <option value="intermediario">Intermediário</option>
                        <option value="avancado">Avançado</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="btn-save-profile"
                    >
                      Salvar Alterações
                    </button>
                  </form>
                ) : (
                  <div className="profile-details">
                    <div className="detail-item">
                      <span className="label">Email</span>
                      <p>{user?.email}</p>
                    </div>

                    <div className="detail-item">
                      <span className="label">Objetivo</span>
                      <p>{student.goal || 'Não definido'}</p>
                    </div>

                    <div className="detail-item">
                      <span className="label">Nível</span>
                      <p className="level-badge-large">{student.level || 'iniciante'}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="profile-section">
                <h2>Estatísticas</h2>
                <div className="stats-grid">
                  <div className="stat">
                    <div className="stat-icon">💪</div>
                    <div className="stat-value">{student.gamification?.totalWorkouts || 0}</div>
                    <div className="stat-label">Treinos Completos</div>
                  </div>

                  <div className="stat">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-value">{student.gamification?.points || 0}</div>
                    <div className="stat-label">Pontos Totais</div>
                  </div>

                  <div className="stat">
                    <div className="stat-icon">🔥</div>
                    <div className="stat-value">{student.gamification?.streak || 0}</div>
                    <div className="stat-label">Dias de Sequência</div>
                  </div>

                  <div className="stat">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value">{student.gamification?.badges?.length || 0}</div>
                    <div className="stat-label">Conquistas</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="admin-profile">
              <h2>Painel do Personal Trainer</h2>
              <p>Email: {user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
