import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuthStore } from '../context/authStore'
import { getOrCreateConversation, getStudent } from '../services/firebaseService'
import { ChatBox } from '../components/ChatBox'
import './Chat.css'

export function Chat() {
  const { studentId } = useParams()
  const { user } = useAuthStore()
  const [conversationId, setConversationId] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !studentId) return

    const setupChat = async () => {
      try {
        const convId = await getOrCreateConversation(user.uid, studentId)
        setConversationId(convId)

        const student = await getStudent(studentId)
        setOtherUser(student)
        setLoading(false)
      } catch (error) {
        console.error('Erro ao configurar chat:', error)
        setLoading(false)
      }
    }

    setupChat()
  }, [user, studentId])

  if (loading) {
    return <div className="chat-loading">Carregando chat...</div>
  }

  return (
    <div className="chat-page">
      <div className="chat-header-info">
        <div className="user-info">
          {otherUser?.profile?.photo ? (
            <img src={otherUser.profile.photo} alt={otherUser?.name} className="user-avatar" />
          ) : (
            <div className="avatar-placeholder">👤</div>
          )}
          <div className="user-details">
            <h2>{otherUser?.name}</h2>
            <p>{otherUser?.goal || 'Sem objetivo definido'}</p>
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
