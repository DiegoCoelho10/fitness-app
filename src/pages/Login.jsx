import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../context/authStore'
import './Auth.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const { user, login, signup } = useAuthStore()

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        await signup(email, password, name, role)
      } else {
        await login(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Erro ao autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="auth-header">
            <h1>FIT</h1>
            <p>Seu app de treino com gamificação</p>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button
              className={`tab ${!isSignup ? 'active' : ''}`}
              onClick={() => {
                setIsSignup(false)
                setError('')
              }}
            >
              Login
            </button>
            <button
              className={`tab ${isSignup ? 'active' : ''}`}
              onClick={() => {
                setIsSignup(true)
                setError('')
              }}
            >
              Cadastro
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {isSignup && (
              <div className="form-group">
                <label htmlFor="name">Nome</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>

            {isSignup && (
              <div className="form-group">
                <label htmlFor="role">Tipo de Conta</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Aluno</option>
                  <option value="personal_trainer">Personal Trainer</option>
                </select>
              </div>
            )}

            <motion.button
              type="submit"
              className="btn btn-primary btn-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? 'Carregando...' : isSignup ? 'Criar conta' : 'Entrar'}
            </motion.button>
          </form>

          {/* Demo Info */}
          <div className="auth-demo">
            <p className="demo-text">
              Credenciais de teste:
            </p>
            <code>
              Email: test@example.com<br />
              Senha: 123456
            </code>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
