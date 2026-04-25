import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { createWorkout, getStudent, sendNotification } from '../services/firebaseService'
import './CreateWorkout.css'

export function CreateWorkout() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [studentName, setStudentName] = useState('')
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'moderado',
    exercises: [{ name: '', sets: 3, reps: 10, weight: '', rest: 60 }]
  })

  React.useEffect(() => {
    if (studentId) {
      getStudent(studentId).then(student => {
        if (student) setStudentName(student.name)
      })
    }
  }, [studentId])

  const addExercise = () => {
    setFormData({
      ...formData,
      exercises: [...formData.exercises, { name: '', sets: 3, reps: 10, weight: '', rest: 60 }]
    })
  }

  const removeExercise = (index) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter((_, i) => i !== index)
    })
  }

  const updateExercise = (index, field, value) => {
    const updated = [...formData.exercises]
    updated[index][field] = value
    setFormData({ ...formData, exercises: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createWorkout(user.uid, studentId, formData)
      await sendNotification(studentId, {
        type: 'workout',
        title: 'Novo Treino!',
        body: `${formData.name} foi atribuído a você`,
        actionUrl: `/dashboard`
      })
      navigate(`/chat/${studentId}`)
    } catch (error) {
      console.error('Erro ao criar treino:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-workout-page">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          ← Voltar
        </button>
        <h1>Novo Treino para {studentName}</h1>
      </div>

      <div className="workout-builder">
        <form onSubmit={handleSubmit}>
          <div className="section">
            <h2>Informações do Treino</h2>

            <div className="form-group">
              <label>Nome do Treino</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Perna Segunda"
                required
              />
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Descreva o objetivo deste treino..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label>Nível de Dificuldade</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
              >
                <option value="facil">Fácil</option>
                <option value="moderado">Moderado</option>
                <option value="dificil">Difícil</option>
                <option value="muito_dificil">Muito Difícil</option>
              </select>
            </div>
          </div>

          <div className="section">
            <div className="section-header">
              <h2>Exercícios</h2>
              <button
                type="button"
                onClick={addExercise}
                className="btn-add-exercise"
              >
                ➕ Adicionar Exercício
              </button>
            </div>

            <div className="exercises-list">
              {formData.exercises.map((exercise, idx) => (
                <div key={idx} className="exercise-card">
                  <div className="exercise-number">#{idx + 1}</div>

                  <div className="exercise-fields">
                    <div className="field">
                      <label>Exercício</label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => updateExercise(idx, 'name', e.target.value)}
                        placeholder="Ex: Supino"
                        required
                      />
                    </div>

                    <div className="field-row">
                      <div className="field">
                        <label>Séries</label>
                        <input
                          type="number"
                          value={exercise.sets}
                          onChange={(e) => updateExercise(idx, 'sets', parseInt(e.target.value))}
                          min="1"
                          max="10"
                        />
                      </div>

                      <div className="field">
                        <label>Reps</label>
                        <input
                          type="number"
                          value={exercise.reps}
                          onChange={(e) => updateExercise(idx, 'reps', parseInt(e.target.value))}
                          min="1"
                          max="50"
                        />
                      </div>

                      <div className="field">
                        <label>Peso (kg)</label>
                        <input
                          type="number"
                          value={exercise.weight}
                          onChange={(e) => updateExercise(idx, 'weight', e.target.value)}
                          placeholder="Ex: 50"
                          step="0.5"
                        />
                      </div>

                      <div className="field">
                        <label>Descanso (seg)</label>
                        <input
                          type="number"
                          value={exercise.rest}
                          onChange={(e) => updateExercise(idx, 'rest', parseInt(e.target.value))}
                          min="15"
                          max="300"
                          step="15"
                        />
                      </div>
                    </div>
                  </div>

                  {formData.exercises.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExercise(idx)}
                      className="btn-remove-exercise"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="section preview-section">
            <h2>Preview do Treino</h2>
            <div className="preview">
              <h3>{formData.name || 'Nome do Treino'}</h3>
              <p>{formData.description || 'Sem descrição'}</p>
              <div className="preview-meta">
                <span>Dificuldade: {formData.difficulty}</span>
                <span>Total de exercícios: {formData.exercises.length}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Criando...' : 'Criar Treino'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
