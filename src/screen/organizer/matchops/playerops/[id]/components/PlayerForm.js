'use client'

import { useState, useEffect } from 'react'
import stl from './PlayerForm.module.scss'

const PlayerForm = ({ initialData, onSubmit, onClose, mode = 'add' }) => {
  // Initialize fullName from initialData if it exists
  const getInitialFullName = () => {
    if (initialData) {
      return `${initialData.first_name}${initialData.last_name ? ' ' + initialData.last_name : ''}`
    }
    return ''
  }

  const [formData, setFormData] = useState({
    fullName: getInitialFullName(),
    phone_number: initialData?.phone_number || '',
    email: initialData?.email || '',
    skill_type: initialData?.skill_type || 'INTERMEDIATE',
    checked_in: initialData?.checked_in || false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Split the full name into first name and last name
    const nameParts = formData.fullName.trim().split(/\s+/)
    const firstName = nameParts[0]
    const lastName = nameParts.slice(1).join(' ')

    onSubmit({
      first_name: firstName,
      last_name: lastName,
      phone_number: formData.phone_number,
      email: formData.email,
      skill_type: formData.skill_type,
      checked_in: formData.checked_in
    })
  }

  return (
    <div className={stl.overlay}>
      <div className={stl.modal}>
        <div className={stl.header}>
          <h2>{mode === 'add' ? 'Add New Player' : 'Edit Player'}</h2>
          <button className={stl.closeButton} onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className={stl.form}>
          <div className={stl.formGroup}>
            <label>
              Player Name <span className={stl.required}>*</span>
            </label>
            <input
              placeholder="Enter full name (e.g., John Doe)"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>
          <div className={stl.formGroup}>
            <label>Phone Number</label>
            <input
              placeholder="Phone Number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>
          <div className={stl.formGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className={stl.formGroup}>
            <label>Skill Level</label>
            <select
              value={formData.skill_type}
              onChange={(e) => setFormData({ ...formData, skill_type: e.target.value })}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div className={stl.formGroup}>
            <label className={stl.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.checked_in}
                onChange={(e) => setFormData({ ...formData, checked_in: e.target.checked })}
              />
              <span>Checked In</span>
            </label>
          </div>
          <div className={stl.buttons}>
            <button type="submit" className={stl.submitButton}>
              {mode === 'add' ? 'Add Player' : 'Update Player'}
            </button>
            <button type="button" className={stl.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PlayerForm 