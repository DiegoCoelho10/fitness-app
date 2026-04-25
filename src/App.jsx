import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'

// Pages
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Students } from './pages/Students'
import { CreateWorkout } from './pages/CreateWorkout'
import { MyWorkout } from './pages/MyWorkout'
import { Chat } from './pages/Chat'
import { Profile } from './pages/Profile'
import { Ranking } from './pages/Ranking'

import './App.css'

function App() {
  const { initAuth, user, loading } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            user ? (
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/students" element={<ProtectedRoute role="personal_trainer"><Students /></ProtectedRoute>} />
                  <Route path="/students/:studentId/workout/new" element={<ProtectedRoute role="personal_trainer"><CreateWorkout /></ProtectedRoute>} />
                  <Route path="/workouts" element={<ProtectedRoute role="personal_trainer"><Ranking /></ProtectedRoute>} />
                  <Route path="/chat/:studentId" element={<Chat />} />
                  <Route path="/workout/:workoutId" element={<MyWorkout />} />
                  <Route path="/ranking" element={<ProtectedRoute role="personal_trainer"><Ranking /></ProtectedRoute>} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
