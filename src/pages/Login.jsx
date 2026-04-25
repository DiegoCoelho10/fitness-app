import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import './Auth.css'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const navigate = useNavigate()
  const { user, login, signup } = useAuthStore()

  // Código de convite válido para Personal Trainers
  const VALID_INVITE_CODE = 'TRAINER2024'

  // Este useEffect observa mudanças no user e navega automaticamente
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
      // Validar código de convite para Personal Trainers
      if (isSignup && role === 'personal_trainer') {
        if (!inviteCode || inviteCode.trim() === '') {
          throw new Error('Código de convite é obrigatório para Personal Trainers')
        }
        if (inviteCode !== VALID_INVITE_CODE) {
          throw new Error('Código de convite inválido')
        }
      }

      if (isSignup) {
        await signup(email, password, name, role)
      } else {
        await login(email, password)
      }
      // NÃO CHAMA navigate aqui! O useEffect vai fazer isso
    } catch (err) {
      setError(err.message || 'Erro ao autenticar')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
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
              <div className="error-message">
                {error}
              </div>
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
              <>
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

                {role === 'personal_trainer' && (
                  <div className="form-group">
                    <label htmlFor="inviteCode">Código de Convite</label>
                    <input
                      type="text"
                      id="inviteCode"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      placeholder="Digite o código de convite"
                      required
                    />
                    <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>
                      Entre em contato com o administrador para obter seu código
                    </small>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? 'Carregando...' : isSignup ? 'Criar conta' : 'Entrar'}
            </button>
          </form>

          {/* Demo Info */}
          <div className="auth-demo">
            <p className="demo-text">
              Credenciais de teste:
            </p>
            <code>
              Email: test@example.com<br />
              Senha: 123456<br />
              Código PT: TRAINER2024
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
