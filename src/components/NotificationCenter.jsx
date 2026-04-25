import React, { useState, useEffect } from 'react'
import { subscribeToNotifications, markNotificationAsRead } from '../services/firebaseService'
import './NotificationCenter.css'

export function NotificationCenter({ userId }) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(userId, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }))
      setNotifications(notifs)
    })

    return unsubscribe
  }, [userId])

  const handleNotificationClick = async (notificationId) => {
    await markNotificationAsRead(userId, notificationId)
  }

  const getIcon = (type) => {
    const icons = {
      workout: '💪',
      message: '💬',
      achievement: '🏆',
      reminder: '⏰',
      default: '📢'
    }
    return icons[type] || icons.default
  }

  return (
    <div className="notification-center">
      <button className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        🔔
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notificações</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                  onClick={() => handleNotificationClick(notif.id)}
                >
                  <span className="notification-icon">{getIcon(notif.type)}</span>
                  <div className="notification-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.body}</p>
                    <small>{notif.timestamp.toLocaleString('pt-BR')}</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
