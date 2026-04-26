import React, { useState } from 'react'
import { uploadProgressPhoto } from '../services/firebaseService'
import './PhotoUpload.css'

export function PhotoUpload({ userId, onPhotoUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!preview) return

    setUploading(true)
    try {
      // Converter preview data URL para Blob
      const response = await fetch(preview)
      const blob = await response.blob()
      
      await uploadProgressPhoto(userId, blob)
      alert('Foto de progresso salva com sucesso!')
      setPreview(null)
      onPhotoUploaded()
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="photo-upload-container">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        id="photo-input"
        className="photo-input"
      />

      {!preview ? (
        <label htmlFor="photo-input" className="upload-zone">
          <div className="upload-icon">📷</div>
          <p className="upload-text">Clique para selecionar uma foto</p>
          <small>JPG, PNG (máx 5MB)</small>
        </label>
      ) : (
        <div className="preview-container">
          <img src={preview} alt="preview" className="preview-image" />
          <div className="preview-actions">
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-confirm"
            >
              {uploading ? 'Enviando...' : '✓ Confirmar'}
            </button>
            <button
              onClick={() => setPreview(null)}
              disabled={uploading}
              className="btn-cancel"
            >
              ✕ Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
