import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../context/authStore'
import { subscribeToNotifications, markNotificationAsRead } from '../services/firebaseService'
import './NotificationCenter.css'

export function NotificationCenter() {
  const { user } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const unsubscribe = subscribeToNotifications(user.uid, (notificationsData) => {
      setNotifications(notificationsData)
      setUnreadCount(notificationsData.filter(n => !n.read).length)
    })

    return unsubscribe
  }, [user])

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markNotificationAsRead(user.uid, notification.id)
    }
  }

  return (
    <div className="notification-center">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="notification-bell"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>

      {showPanel && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>Notificações</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="btn-close"
            >
              ✕
            </button>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <p className="empty-notif">Nenhuma notificação</p>
            ) : (
              notifications.slice(0, 10).map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notif-icon">
                    {notif.type === 'workout' && '💪'}
                    {notif.type === 'diet' && '🥗'}
                    {notif.type === 'achievement' && '🏆'}
                    {notif.type === 'message' && '💬'}
                  </div>

                  <div className="notif-content">
                    <p className="notif-title">{notif.title}</p>
                    <small className="notif-body">{notif.body}</small>
                    <small className="notif-time">
                      {notif.timestamp.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>

                  {!notif.read && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
