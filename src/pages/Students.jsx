import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import { getAlunosByTrainer, createAluno, updateAluno, deleteAluno } from '../services/firebaseService'
import './Students.css'

export function Students() {
  const { user } = useAuthStore()
  const [alunos, setAlunos] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    goal: '',
    height: '',
    weight: '',
    dateOfBirth: '',
    gender: ''
  })

  useEffect(() => {
    const unsubscribe = getAlunosByTrainer(user.uid, (alunosData) => {
      setAlunos(alunosData)
    })
    return unsubscribe
  }, [user.uid])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        await updateAluno(editingId, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          goal: formData.goal,
          'measurements.height': parseFloat(formData.height) || 0,
          'measurements.weight': parseFloat(formData.weight) || 0,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        })
      } else {
        await createAluno(user.uid, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          goal: formData.goal,
          height: parseFloat(formData.height) || 0,
          weight: parseFloat(formData.weight) || 0,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender
        })
      }
      
      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao salvar aluno: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      goal: '',
      height: '',
      weight: '',
      dateOfBirth: '',
      gender: ''
    })
    setEditingId(null)
  }

  const handleEdit = (aluno) => {
    setFormData({
      name: aluno.name,
      email: aluno.email,
      phone: aluno.phone || '',
      goal: aluno.goal || '',
      height: aluno.measurements?.height || '',
      weight: aluno.measurements?.weight || '',
      dateOfBirth: aluno.dateOfBirth || '',
      gender: aluno.gender || ''
    })
    setEditingId(aluno.id)
    setShowForm(true)
  }

  const handleDelete = async (alunoId) => {
    if (window.confirm('Tem certeza que deseja deletar este aluno?')) {
      await deleteAluno(alunoId)
    }
  }

  return (
    <div className="students-page">
      <div className="page-header">
        <h1>Gerenciar Alunos</h1>
        <button className="btn-add" onClick={() => {
          resetForm()
          setShowForm(!showForm)
        }}>
          {showForm ? '✕ Cancelar' : '➕ Novo Aluno'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="student-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nome completo"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@example.com"
                  required
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
                  placeholder="(11) 99999-9999"
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
                  placeholder="Ex: Ganhar massa"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Altura (cm)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  placeholder="170"
                  step="0.1"
                />
              </div>

              <div className="form-group">
                <label>Peso (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="75"
                  step="0.1"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
            </button>
          </form>
        </div>
      )}

      <div className="students-grid">
        {alunos.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum aluno adicionado</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Adicionar Primeiro Aluno
            </button>
          </div>
        ) : (
          alunos.map(aluno => (
            <div key={aluno.id} className="student-card">
              <div className="card-header">
                {aluno.profilePhoto ? (
                  <img src={aluno.profilePhoto} alt={aluno.name} />
                ) : (
                  <div className="photo-placeholder">👤</div>
                )}
              </div>

              <div className="card-body">
                <h3>{aluno.name}</h3>
                <p className="email">{aluno.email}</p>

                <div className="info-section">
                  <small><strong>Objetivo:</strong> {aluno.goal || 'Não definido'}</small>
                  <small><strong>Altura:</strong> {aluno.measurements?.height || '-'} cm</small>
                  <small><strong>Peso:</strong> {aluno.measurements?.weight || '-'} kg</small>
                </div>

                <div className="stats-section">
                  <div className="mini-stat">
                    <span>💪</span>
                    <span>{aluno.gamification?.totalWorkouts || 0}</span>
                  </div>
                  <div className="mini-stat">
                    <span>⭐</span>
                    <span>{aluno.gamification?.totalPoints || 0}</span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button onClick={() => handleEdit(aluno)} className="btn-edit">
                  ✏️ Editar
                </button>
                <a href={`/chat/${aluno.id}`} className="btn-chat">
                  💬 Chat
                </a>
                <button onClick={() => handleDelete(aluno.id)} className="btn-delete">
                  🗑️ Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
