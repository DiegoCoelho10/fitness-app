import React, { useState } from 'react'
import { uploadProfilePhoto } from '../services/firebaseService'
import './PhotoUpload.css'

export function PhotoUpload({ userId, onPhotoUploaded }) {
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem deve ser menor que 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target.result)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!preview) return

    setLoading(true)
    try {
      const file = await fetch(preview)
        .then(res => res.blob())
        .then(blob => new File([blob], 'profile.jpg', { type: 'image/jpeg' }))

      const url = await uploadProfilePhoto(userId, file)
      onPhotoUploaded(url)
      setPreview(null)
    } catch (err) {
      setError('Erro ao enviar foto: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="photo-upload">
      <label className="upload-area">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={loading}
        />
        {preview ? (
          <div className="preview">
            <img src={preview} alt="Preview" />
          </div>
        ) : (
          <div className="upload-placeholder">
            <span className="upload-icon">📸</span>
            <p>Clique ou arraste uma foto</p>
          </div>
        )}
      </label>

      {error && <div className="error-message">{error}</div>}

      {preview && (
        <div className="upload-actions">
          <button onClick={handleUpload} disabled={loading} className="btn-upload">
            {loading ? 'Enviando...' : 'Enviar Foto'}
          </button>
          <button onClick={() => setPreview(null)} className="btn-cancel">
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
