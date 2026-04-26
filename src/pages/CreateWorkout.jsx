import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { getAlunosByTrainer, getExercises, createTreino } from '../services/firebaseService'
import './CreateWorkout.css'

export function CreateWorkout() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [alunos, setAlunos] = useState([])
  const [allExercises, setAllExercises] = useState([])
  const [selectedAluno, setSelectedAluno] = useState('')
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDesc, setWorkoutDesc] = useState('')
  const [difficulty, setDifficulty] = useState('moderado')
  const [selectedExercises, setSelectedExercises] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        const exercisesData = await getExercises()
        setAllExercises(exercisesData)
      } catch (error) {
        console.error('Erro ao carregar exercícios:', error)
      }
      
      const unsubscribe = getAlunosByTrainer(user.uid, (alunosData) => {
        setAlunos(alunosData)
        setLoading(false)
      })

      return unsubscribe
    }

    loadData()
  }, [user.uid])

  const handleAddExercise = (exerciseId) => {
    if (!selectedExercises.find(e => e.exerciseId === exerciseId)) {
      const exercise = allExercises.find(e => e.id === exerciseId)
      setSelectedExercises([
        ...selectedExercises,
        {
          exerciseId,
          name: exercise.name,
          sets: 3,
          reps: 10,
          weight: 0,
          rest: 60,
          notes: ''
        }
      ])
    }
  }

  const handleRemoveExercise = (index) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index))
  }

  const handleExerciseChange = (index, field, value) => {
    const updated = [...selectedExercises]
    updated[index] = {
      ...updated[index],
      [field]: field === 'sets' || field === 'reps' || field === 'weight' || field === 'rest'
        ? parseFloat(value) || 0
        : value
    }
    setSelectedExercises(updated)
  }

  const handleCreateWorkout = async (e) => {
    e.preventDefault()

    if (!selectedAluno || !workoutName || selectedExercises.length === 0) {
      alert('Preencha todos os campos e adicione exercícios')
      return
    }

    setSaving(true)
    try {
      await createTreino(user.uid, selectedAluno, {
        name: workoutName,
        description: workoutDesc,
        difficulty,
        exercises: selectedExercises
      })

      alert('Treino criado com sucesso!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Erro ao criar treino:', error)
      alert('Erro ao criar treino: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="create-loading">Carregando...</div>

  return (
    <div className="create-workout-page">
      <div className="page-header">
        <h1>Criar Novo Treino</h1>
        <p>Prescreva um treino personalizado para seu aluno</p>
      </div>

      <form onSubmit={handleCreateWorkout} className="workout-form">
        {/* Seção 1: Básico */}
        <div className="form-section">
          <h2>Informações Básicas</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Aluno *</label>
              <select
                value={selectedAluno}
                onChange={(e) => setSelectedAluno(e.target.value)}
                required
              >
                <option value="">Selecione um aluno</option>
                {alunos.map(aluno => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Dificuldade</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="facil">Fácil</option>
                <option value="moderado">Moderado</option>
                <option value="dificil">Difícil</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Nome do Treino *</label>
            <input
              type="text"
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="Ex: Peito e Costas"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Descrição</label>
            <textarea
              value={workoutDesc}
              onChange={(e) => setWorkoutDesc(e.target.value)}
              placeholder="Descreva o objetivo deste treino"
              rows="3"
            />
          </div>
        </div>

        {/* Seção 2: Adicionar Exercícios */}
        <div className="form-section">
          <h2>Adicionar Exercícios</h2>

          <div className="exercises-selector">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleAddExercise(e.target.value)
                  e.target.value = ''
                }
              }}
            >
              <option value="">Selecione um exercício para adicionar...</option>
              {allExercises
                .filter(ex => !selectedExercises.find(se => se.exerciseId === ex.id))
                .map(exercise => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
            </select>
          </div>

          {selectedExercises.length === 0 ? (
            <p className="empty-exercises">Nenhum exercício adicionado. Adicione exercícios acima.</p>
          ) : (
            <div className="exercises-list">
              {selectedExercises.map((exercise, idx) => (
                <div key={idx} className="exercise-card">
                  <div className="exercise-header">
                    <h3>{exercise.name}</h3>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(idx)}
                      className="btn-remove"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="exercise-form-grid">
                    <div className="form-group-small">
                      <label>Séries</label>
                      <input
                        type="number"
                        value={exercise.sets}
                        onChange={(e) => handleExerciseChange(idx, 'sets', e.target.value)}
                        min="1"
                        max="10"
                      />
                    </div>

                    <div className="form-group-small">
                      <label>Repetições</label>
                      <input
                        type="number"
                        value={exercise.reps}
                        onChange={(e) => handleExerciseChange(idx, 'reps', e.target.value)}
                        min="1"
                        max="50"
                      />
                    </div>

                    <div className="form-group-small">
                      <label>Peso (kg)</label>
                      <input
                        type="number"
                        value={exercise.weight}
                        onChange={(e) => handleExerciseChange(idx, 'weight', e.target.value)}
                        step="0.5"
                        min="0"
                      />
                    </div>

                    <div className="form-group-small">
                      <label>Descanso (s)</label>
                      <input
                        type="number"
                        value={exercise.rest}
                        onChange={(e) => handleExerciseChange(idx, 'rest', e.target.value)}
                        min="0"
                        max="300"
                      />
                    </div>
                  </div>

                  <div className="form-group-small">
                    <label>Notas</label>
                    <input
                      type="text"
                      value={exercise.notes}
                      onChange={(e) => handleExerciseChange(idx, 'notes', e.target.value)}
                      placeholder="Ex: Controle o movimento"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-cancel-form"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || selectedExercises.length === 0}
            className="btn-submit-form"
          >
            {saving ? 'Criando...' : '✓ Criar Treino'}
          </button>
        </div>
      </form>
    </div>
  )
}
