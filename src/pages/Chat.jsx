import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { getOrCreateConversation, getAluno, getPersonalTrainer } from '../services/firebaseService'
import { ChatBox } from '../components/ChatBox'
import './Chat.css'

export function Chat() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { user, userRole } = useAuthStore()
  const [conversationId, setConversationId] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !studentId) return

    const setupChat = async () => {
      try {
        const convId = await getOrCreateConversation(user.uid, studentId)
        setConversationId(convId)

        // Carregar dados do outro usuário
        let userData
        if (userRole === 'personal_trainer') {
          userData = await getAluno(studentId)
        } else {
          userData = await getPersonalTrainer(studentId)
        }
        
        setOtherUser(userData)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao configurar chat:', error)
        setLoading(false)
      }
    }

    setupChat()
  }, [user, studentId, userRole])

  if (loading) {
    return <div className="chat-loading">Carregando chat...</div>
  }

  if (!otherUser) {
    return (
      <div className="chat-error">
        <p>Usuário não encontrado</p>
        <button onClick={() => navigate(-1)}>Voltar</button>
      </div>
    )
  }

  return (
    <div className="chat-page">
      <div className="chat-header-info">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="btn-back">
            ← Voltar
          </button>
        </div>

        <div className="user-info">
          {otherUser?.profilePhoto ? (
            <img src={otherUser.profilePhoto} alt={otherUser?.name} className="user-avatar" />
          ) : (
            <div className="avatar-placeholder">👤</div>
          )}
          <div className="user-details">
            <h2>{otherUser?.name}</h2>
            <p>{userRole === 'personal_trainer' ? otherUser?.goal : 'Personal Trainer'}</p>
          </div>
        </div>
      </div>

      {conversationId && (
        <ChatBox
          conversationId={conversationId}
          userId={user.uid}
          otherUserName={otherUser?.name || 'Usuário'}
        />
      )}
    </div>
  )
}
