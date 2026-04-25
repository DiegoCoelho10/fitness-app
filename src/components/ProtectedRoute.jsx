import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading, userRole, hasAccess, checkAccess } = useAuthStore()
  const [accessChecked, setAccessChecked] = useState(false)

  useEffect(() => {
    if (user && userRole === 'student') {
      checkAccess(user.uid).then(() => {
        setAccessChecked(true)
      })
    } else {
      setAccessChecked(true)
    }
  }, [user, userRole, checkAccess])

  if (loading || !accessChecked) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Carregando...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />
  }

  if (userRole === 'student' && !hasAccess) {
    return <SubscriptionExpired />
  }

  return children
}

function SubscriptionExpired() {
  return (
    <div className="subscription-expired">
      <div className="expired-content">
        <div className="expired-icon">😢</div>
        <h1>Assinatura Expirada</h1>
        <p>Sua assinatura foi cancelada ou expirou. Renove o seu acesso para continuar usando o app.</p>
        
        <div className="expired-actions">
          <button 
            onClick={() => window.location.href = '/payment'}
            className="btn btn-primary btn-lg"
          >
            Renovar Assinatura
          </button>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn btn-secondary"
          >
            Fazer Logout
          </button>
        </div>
      </div>
    </div>
  )
}

/* Estilos do Loading */
const styles = `
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: var(--color-bg-primary);
    gap: var(--spacing-md);
  }
  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 2s linear infinite;
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .subscription-expired {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: var(--color-bg-primary);
    padding: var(--spacing-md);
  }
  .expired-content {
    text-align: center;
    max-width: 420px;
  }
  .expired-icon {
    font-size: 64px;
    margin-bottom: var(--spacing-lg);
  }
  .expired-content h1 {
    color: var(--color-danger);
    margin-bottom: var(--spacing-sm);
  }
  .expired-content p {
    color: var(--color-text-secondary);
    margin-bottom: var(--spacing-lg);
  }
  .expired-actions {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  .expired-actions button {
    width: 100%;
  }
`

export const protectedRouteStyles = styles
