import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getWorkout, completeWorkout, addPoints, updateStreak, uploadProgressPhoto } from '../services/firebaseService'
import { PhotoUpload } from '../components/PhotoUpload'
import './MyWorkout.css'

export function MyWorkout() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const [workout, setWorkout] = useState(null)
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0)
  const [exerciseProgress, setExerciseProgress] = useState({})
  const [timer, setTimer] = useState(null)
  const [isResting, setIsResting] = useState(false)
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    getWorkout(workoutId).then(data => {
      setWorkout(data)
      setLoading(false)
    })
  }, [workoutId])

  useEffect(() => {
    if (!timer) return

    const interval = setInterval(() => {
      setTimer(t => t - 1)
    }, 1000)

    if (timer === 0) {
      setIsResting(false)
      setTimer(null)
    }

    return () => clearInterval(interval)
  }, [timer])

  if (loading) return <div className="workout-loading">Carregando treino...</div>
  if (!workout) return <div className="error">Treino não encontrado</div>

  const currentExercise = workout.exercises[currentExerciseIdx]
  const progress = exerciseProgress[currentExerciseIdx] || {
    sets: 0,
    reps: 0,
    weight: currentExercise.weight
  }

  const handleExerciseComplete = () => {
    setExerciseProgress({
      ...exerciseProgress,
      [currentExerciseIdx]: progress
    })

    if (currentExerciseIdx < workout.exercises.length - 1) {
      setIsResting(true)
      setTimer(60)
      setTimeout(() => {
        setCurrentExerciseIdx(currentExerciseIdx + 1)
      }, 1000)
    } else {
      setCompleted(true)
      handleWorkoutComplete()
    }
  }

  const handleWorkoutComplete = async () => {
    await completeWorkout(workoutId, {
      exercises: exerciseProgress,
      duration: 0,
      notes: ''
    })

    await addPoints(workout.studentId, 50, 'workout_completed')
    await updateStreak(workout.studentId)
  }

  const incrementSet = () => {
    if (progress.sets < currentExercise.sets) {
      setExerciseProgress({
        ...exerciseProgress,
        [currentExerciseIdx]: {
          ...progress,
          sets: progress.sets + 1
        }
      })
    }
  }

  const incrementReps = () => {
    if (progress.reps < currentExercise.reps) {
      setExerciseProgress({
        ...exerciseProgress,
        [currentExerciseIdx]: {
          ...progress,
          reps: progress.reps + 1
        }
      })
    }
  }

  if (completed) {
    return (
      <div className="workout-completed">
        <div className="celebration">
          <div className="emoji-burst">🎉</div>
          <h1>Parabéns!</h1>
          <p>Você completou o treino!</p>
          <div className="points-earned">
            <span className="icon">⭐</span>
            <span className="value">+50 Pontos</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-back-home">
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="my-workout-page">
      {/* Progress Bar */}
      <div className="progress-tracker">
        <div className="tracker-info">
          <h2>{workout.name}</h2>
          <p>Exercício {currentExerciseIdx + 1} de {workout.exercises.length}</p>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentExerciseIdx) / workout.exercises.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Main Exercise */}
      <div className="exercise-main">
        <div className="exercise-card">
          <div className="exercise-header">
            <h2>{currentExercise.name}</h2>
            <span className="exercise-number">#{currentExerciseIdx + 1}</span>
          </div>

          {isResting ? (
            <div className="rest-timer">
              <p>Tempo de descanso</p>
              <div className="timer-display">{timer}s</div>
              <p className="rest-text">Respire e prepare-se para o próximo exercício</p>
            </div>
          ) : (
            <>
              <div className="exercise-specs">
                <div className="spec-item">
                  <span className="label">Séries</span>
                  <span className="value">{currentExercise.sets}</span>
                </div>
                <div className="spec-item">
                  <span className="label">Repetições</span>
                  <span className="value">{currentExercise.reps}</span>
                </div>
                <div className="spec-item">
                  <span className="label">Peso</span>
                  <span className="value">{currentExercise.weight || '-'} kg</span>
                </div>
              </div>

              {/* Progress Counters */}
              <div className="exercise-progress">
                <div className="counter-section">
                  <p className="counter-label">Séries Feitas</p>
                  <div className="counter">
                    <button
                      onClick={() => setExerciseProgress({
                        ...exerciseProgress,
                        [currentExerciseIdx]: {
                          ...progress,
                          sets: Math.max(0, progress.sets - 1)
                        }
                      })}
                    >
                      −
                    </button>
                    <div className="counter-display">{progress.sets}</div>
                    <button onClick={incrementSet}>+</button>
                  </div>
                </div>

                <div className="counter-section">
                  <p className="counter-label">Repetições Feitas</p>
                  <div className="counter">
                    <button
                      onClick={() => setExerciseProgress({
                        ...exerciseProgress,
                        [currentExerciseIdx]: {
                          ...progress,
                          reps: Math.max(0, progress.reps - 1)
                        }
                      })}
                    >
                      −
                    </button>
                    <div className="counter-display">{progress.reps}</div>
                    <button onClick={incrementReps}>+</button>
                  </div>
                </div>
              </div>

              {/* Photo Upload for Exercise */}
              <div className="exercise-photo">
                <button
                  onClick={() => setShowPhotoUpload(!showPhotoUpload)}
                  className="btn-photo"
                >
                  📸 Tirar Foto do Exercício
                </button>
                {showPhotoUpload && (
                  <PhotoUpload userId={workout.studentId} onPhotoUploaded={() => setShowPhotoUpload(false)} />
                )}
              </div>

              {/* Complete Exercise Button */}
              <button
                onClick={handleExerciseComplete}
                className="btn-complete-exercise"
              >
                {currentExerciseIdx === workout.exercises.length - 1
                  ? 'Finalizar Treino'
                  : 'Próximo Exercício'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sidebar with Exercise List */}
      <div className="exercises-sidebar">
        <h3>Exercícios</h3>
        <div className="exercises-list">
          {workout.exercises.map((ex, idx) => (
            <div
              key={idx}
              className={`exercise-item ${idx === currentExerciseIdx ? 'active' : ''} ${
                exerciseProgress[idx] ? 'completed' : ''
              }`}
            >
              <div className="item-number">{idx + 1}</div>
              <div className="item-info">
                <p>{ex.name}</p>
                {exerciseProgress[idx] && (
                  <small>
                    {exerciseProgress[idx].sets}x{exerciseProgress[idx].reps}
                  </small>
                )}
              </div>
              {exerciseProgress[idx] && <span className="checkmark">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
