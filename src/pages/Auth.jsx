import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import './Auth.css'

export function Auth() {
  const navigate = useNavigate()
  const { login, signup } = useAuthStore()
  
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('student')
  const [trainerCode, setTrainerCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (role === 'personal_trainer' && trainerCode !== 'TRAINER2024') {
      setError('Código de personal trainer inválido')
      return
    }

    setLoading(true)
    try {
      await signup(email, password, name, role)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>💪 FITNESS</h1>
            <p>{isSignup ? 'Crie sua conta' : 'Faça login'}</p>
          </div>

          <div className="auth-tabs">
            <button
              onClick={() => setIsSignup(false)}
              className={`tab ${!isSignup ? 'active' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsSignup(true)}
              className={`tab ${isSignup ? 'active' : ''}`}
            >
              Cadastro
            </button>
          </div>

          <form onSubmit={isSignup ? handleSignup : handleLogin} className="auth-form">
            {error && <div className="error-message">{error}</div>}

            {isSignup && (
              <>
                <div className="form-group">
                  <label>Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Conta</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="student">Aluno</option>
                    <option value="personal_trainer">Personal Trainer</option>
                  </select>
                </div>

                {role === 'personal_trainer' && (
                  <div className="form-group">
                    <label>Código PT (Trainer 2024)</label>
                    <input
                      type="password"
                      value={trainerCode}
                      onChange={(e) => setTrainerCode(e.target.value)}
                      placeholder="Código de acesso PT"
                      required
                    />
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Carregando...' : isSignup ? 'Cadastrar' : 'Entrar'}
            </button>
          </form>

          <div className="auth-demo">
            <p className="demo-text">💡 Credenciais de teste:</p>
            <code>
              Email: trainer@example.com<br/>
              Senha: 123456
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
