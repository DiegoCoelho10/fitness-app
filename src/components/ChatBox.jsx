import React, { useState, useEffect, useRef } from 'react'
import { sendMessage, subscribeToChat } from '../services/firebaseService'
import './ChatBox.css'

export function ChatBox({ conversationId, userId, otherUserName }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (!conversationId) return
    
    const unsubscribe = subscribeToChat(conversationId, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }))
      setMessages(msgs)
      scrollToBottom()
    })

    return unsubscribe
  }, [conversationId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setLoading(true)
    try {
      await sendMessage(conversationId, userId, newMessage)
      setNewMessage('')
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chatbox">
      <div className="chatbox-header">
        <h3>{otherUserName}</h3>
      </div>

      <div className="chatbox-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{msg.text}</p>
                <span className="message-time">
                  {msg.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chatbox-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !newMessage.trim()}>
          📤
        </button>
      </form>
    </div>
  )
}
