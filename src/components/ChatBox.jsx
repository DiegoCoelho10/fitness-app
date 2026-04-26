import React, { useState, useEffect, useRef } from 'react'
import { sendMessage, subscribeToChat } from '../services/firebaseService'
import './ChatBox.css'

export function ChatBox({ conversationId, userId, otherUserName }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const unsubscribe = subscribeToChat(conversationId, (messagesData) => {
      setMessages(messagesData)
      scrollToBottom()
    })

    return unsubscribe
  }, [conversationId])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputValue.trim()) return

    setSending(true)
    try {
      await sendMessage(conversationId, userId, inputValue.trim())
      setInputValue('')
      scrollToBottom()
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      alert('Erro ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="chatbox-container">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-chat">
            <p>Nenhuma mensagem ainda. Comece uma conversa! 💬</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`message ${message.senderId === userId ? 'own' : 'other'}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <small className="message-time">
                  {message.timestamp.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </small>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Digite uma mensagem..."
          disabled={sending}
          className="message-input"
        />
        <button
          type="submit"
          disabled={sending || !inputValue.trim()}
          className="btn-send"
        >
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  )
}
