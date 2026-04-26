import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './context/authStore'
import { Layout } from './components/Layout'
import { Auth } from './pages/Auth'
import { Dashboard } from './pages/Dashboard'
import { Students } from './pages/Students'
import { Profile } from './pages/Profile'
import { CreateWorkout } from './pages/CreateWorkout'
import { MyWorkout } from './pages/MyWorkout'
import { Chat } from './pages/Chat'
import { Ranking } from './pages/Ranking'
import './App.css'

function ProtectedRoute({ children }) {
  const { loading } = useAuthStore()

  if (loading) {
    return <div className="loading-screen">Carregando...</div>
  }

  return <Layout>{children}</Layout>
}

function App() {
  const { loading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (loading) {
    return <div className="loading-screen">Carregando...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Auth />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/students/:studentId/workout/new" element={<ProtectedRoute><CreateWorkout /></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
        <Route path="/chat/:studentId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/workout/:workoutId" element={<ProtectedRoute><MyWorkout /></ProtectedRoute>} />
        <Route path="/ranking" element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
