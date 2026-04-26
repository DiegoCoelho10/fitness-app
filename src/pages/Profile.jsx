import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import { getAluno, updateAluno, getPersonalTrainer, updatePersonalTrainer, uploadProfilePhoto } from '../services/firebaseService'
import { GamificationWidget } from '../components/GamificationWidget'
import './Profile.css'

export function Profile() {
  const { user, userRole } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    height: '',
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    arm: '',
    leg: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    specialty: ''
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        let profileData
        if (userRole === 'student') {
          profileData = await getAluno(user.uid)
        } else {
          profileData = await getPersonalTrainer(user.uid)
        }
        
        if (profileData) {
          setProfile(profileData)
          setFormData({
            name: profileData.name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            goal: profileData.goal || '',
            height: profileData.measurements?.height || '',
            weight: profileData.measurements?.weight || '',
            chest: profileData.measurements?.chest || '',
            waist: profileData.measurements?.waist || '',
            hips: profileData.measurements?.hips || '',
            arm: profileData.measurements?.arm || '',
            leg: profileData.measurements?.leg || '',
            dateOfBirth: profileData.dateOfBirth || '',
            gender: profileData.gender || '',
            bio: profileData.bio || '',
            specialty: profileData.specialty || ''
          })
        }
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, userRole])

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setPhotoLoading(true)
    try {
      const url = await uploadProfilePhoto(user.uid, file, userRole === 'personal_trainer' ? 'user' : 'aluno')
      setProfile({ ...profile, profilePhoto: url })
      alert('Foto atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload: ' + error.message)
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }

      if (userRole === 'student') {
        updateData.goal = formData.goal
        updateData.dateOfBirth = formData.dateOfBirth
        updateData.gender = formData.gender
        updateData['measurements.height'] = parseFloat(formData.height) || 0
        updateData['measurements.weight'] = parseFloat(formData.weight) || 0
        updateData['measurements.chest'] = parseFloat(formData.chest) || 0
        updateData['measurements.waist'] = parseFloat(formData.waist) || 0
        updateData['measurements.hips'] = parseFloat(formData.hips) || 0
        updateData['measurements.arm'] = parseFloat(formData.arm) || 0
        updateData['measurements.leg'] = parseFloat(formData.leg) || 0
        
        await updateAluno(user.uid, updateData)
      } else {
        updateData.bio = formData.bio
        updateData.specialty = formData.specialty
        
        await updatePersonalTrainer(user.uid, updateData)
      }

      setProfile({ ...profile, ...formData })
      setEditing(false)
      alert('Perfil atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar: ' + error.message)
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

        {/* Avatar & Header */}
        <div className="profile-header">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              {profile?.profilePhoto ? (
                <img src={profile.profilePhoto} alt={profile?.name} className="profile-avatar" />
              ) : (
                <div className="avatar-placeholder">👤</div>
              )}
            </div>
            <label className="photo-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={photoLoading}
              />
              <span>{photoLoading ? 'Enviando...' : '📷 Alterar Foto'}</span>
            </label>
          </div>

          <div className="profile-info">
            <h1>{profile?.name}</h1>
            <p className="role-badge">
              {userRole === 'student' ? '💪 Aluno' : '💼 Personal Trainer'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="profile-content">
          {userRole === 'student' && profile && (
            <GamificationWidget gamification={profile.gamification || {}} />
          )}

          <div className="profile-section">
            <div className="section-header">
              <h2>Informações Pessoais</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="btn-edit-profile"
              >
                {editing ? '✕ Cancelar' : '✏️ Editar'}
              </button>
            </div>

            {editing ? (
              <form className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nome</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Gênero</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                </div>

                {userRole === 'student' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Data de Nascimento</label>
                        <input
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                        />
                      </div>

                      <div className="form-group">
                        <label>Objetivo</label>
                        <input
                          type="text"
                          value={formData.goal}
                          onChange={(e) => setFormData({...formData, goal: e.target.value})}
                        />
                      </div>
                    </div>

                    <h3>Medidas Físicas</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Altura (cm)</label>
                        <input
                          type="number"
                          value={formData.height}
                          onChange={(e) => setFormData({...formData, height: e.target.value})}
                          step="0.1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Peso (kg)</label>
                        <input
                          type="number"
                          value={formData.weight}
                          onChange={(e) => setFormData({...formData, weight: e.target.value})}
                          step="0.1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Peito (cm)</label>
                        <input
                          type="number"
                          value={formData.chest}
                          onChange={(e) => setFormData({...formData, chest: e.target.value})}
                          step="0.1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Cintura (cm)</label>
                        <input
                          type="number"
                          value={formData.waist}
                          onChange={(e) => setFormData({...formData, waist: e.target.value})}
                          step="0.1"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Quadril (cm)</label>
                        <input
                          type="number"
                          value={formData.hips}
                          onChange={(e) => setFormData({...formData, hips: e.target.value})}
                          step="0.1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Braço (cm)</label>
                        <input
                          type="number"
                          value={formData.arm}
                          onChange={(e) => setFormData({...formData, arm: e.target.value})}
                          step="0.1"
                        />
                      </div>

                      <div className="form-group">
                        <label>Perna (cm)</label>
                        <input
                          type="number"
                          value={formData.leg}
                          onChange={(e) => setFormData({...formData, leg: e.target.value})}
                          step="0.1"
                        />
                      </div>
                    </div>
                  </>
                )}

                {userRole === 'personal_trainer' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Bio</label>
                        <textarea
                          value={formData.bio}
                          onChange={(e) => setFormData({...formData, bio: e.target.value})}
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label>Especialidade</label>
                        <input
                          type="text"
                          value={formData.specialty}
                          onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                          placeholder="Ex: Musculação, Emagrecimento"
                        />
                      </div>
                    </div>
                  </>
                )}

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
                  <p>{profile?.email}</p>
                </div>

                <div className="detail-item">
                  <span className="label">Telefone</span>
                  <p>{profile?.phone || '-'}</p>
                </div>

                {userRole === 'student' && (
                  <>
                    <div className="detail-item">
                      <span className="label">Objetivo</span>
                      <p>{profile?.goal || '-'}</p>
                    </div>

                    <div className="detail-item">
                      <span className="label">Data de Nascimento</span>
                      <p>{profile?.dateOfBirth || '-'}</p>
                    </div>

                    <h3>Medidas Físicas</h3>
                    <div className="measurements-grid">
                      <div className="measurement">
                        <span className="label">Altura</span>
                        <p>{profile?.measurements?.height || '-'} cm</p>
                      </div>
                      <div className="measurement">
                        <span className="label">Peso</span>
                        <p>{profile?.measurements?.weight || '-'} kg</p>
                      </div>
                      <div className="measurement">
                        <span className="label">Peito</span>
                        <p>{profile?.measurements?.chest || '-'} cm</p>
                      </div>
                      <div className="measurement">
                        <span className="label">Cintura</span>
                        <p>{profile?.measurements?.waist || '-'} cm</p>
                      </div>
                      <div className="measurement">
                        <span className="label">Quadril</span>
                        <p>{profile?.measurements?.hips || '-'} cm</p>
                      </div>
                      <div className="measurement">
                        <span className="label">Braço</span>
                        <p>{profile?.measurements?.arm || '-'} cm</p>
                      </div>
                      <div className="measurement">
                        <span className="label">Perna</span>
                        <p>{profile?.measurements?.leg || '-'} cm</p>
                      </div>
                    </div>
                  </>
                )}

                {userRole === 'personal_trainer' && (
                  <>
                    <div className="detail-item">
                      <span className="label">Bio</span>
                      <p>{profile?.bio || '-'}</p>
                    </div>

                    <div className="detail-item">
                      <span className="label">Especialidade</span>
                      <p>{profile?.specialty || '-'}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
