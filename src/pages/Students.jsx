import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import { getStudentsByTrainer, addStudent, updateStudent, deleteStudent } from '../services/firebaseService'
import './Students.css'

export function Students() {
  const { user } = useAuthStore()
  const [students, setStudents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    goal: '',
    level: 'iniciante'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = getStudentsByTrainer(user.uid, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setStudents(docs)
    })
    return unsubscribe
  }, [user.uid])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        await updateStudent(editingId, formData)
      } else {
        await addStudent(user.uid, formData)
      }
      setFormData({ name: '', email: '', goal: '', level: 'iniciante' })
      setShowForm(false)
      setEditingId(null)
    } catch (error) {
      console.error('Erro:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (studentId) => {
    if (window.confirm('Tem certeza que deseja deletar este aluno?')) {
      await deleteStudent(studentId)
    }
  }

  const handleEdit = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      goal: student.goal || '',
      level: student.level || 'iniciante'
    })
    setEditingId(student.id)
    setShowForm(true)
  }

  return (
    <div className="students-page">
      <div className="page-header">
        <h1>Gerenciar Alunos</h1>
        <button className="btn-add" onClick={() => {
          setShowForm(!showForm)
          setEditingId(null)
          setFormData({ name: '', email: '', goal: '', level: 'iniciante' })
        }}>
          {showForm ? '✕ Cancelar' : '➕ Novo Aluno'}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <form onSubmit={handleSubmit} className="student-form">
            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="form-row">
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
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
            </button>
          </form>
        </div>
      )}

      <div className="students-grid">
        {students.length === 0 ? (
          <div className="empty-state">
            <p>Nenhum aluno adicionado</p>
            <button onClick={() => setShowForm(true)} className="btn-primary">
              Adicionar Primeiro Aluno
            </button>
          </div>
        ) : (
          students.map(student => (
            <div key={student.id} className="student-card-large">
              <div className="card-header">
                {student.profile?.photo ? (
                  <img src={student.profile.photo} alt={student.name} />
                ) : (
                  <div className="photo-placeholder">👤</div>
                )}
              </div>

              <div className="card-body">
                <h3>{student.name}</h3>
                <p className="email">{student.email}</p>
                
                <div className="goal-section">
                  <span className="label">Objetivo:</span>
                  <p>{student.goal || 'Não definido'}</p>
                </div>

                <div className="level-section">
                  <span className="label">Nível:</span>
                  <div className="level-badge">{student.level || 'iniciante'}</div>
                </div>

                <div className="stats-section">
                  <div className="mini-stat">
                    <span className="icon">💪</span>
                    <span>{student.gamification?.totalWorkouts || 0} treinos</span>
                  </div>
                  <div className="mini-stat">
                    <span className="icon">⭐</span>
                    <span>{student.gamification?.points || 0} pts</span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button onClick={() => handleEdit(student)} className="btn-edit">
                  ✏️ Editar
                </button>
                <a href={`/chat/${student.id}`} className="btn-chat">
                  💬 Chat
                </a>
                <button onClick={() => handleDelete(student.id)} className="btn-delete">
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
