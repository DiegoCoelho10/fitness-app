import React from 'react'
import { Sidebar } from './Sidebar'
import './Layout.css'

export function Layout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="layout-content">
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}
