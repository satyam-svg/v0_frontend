'use client'

import { useState } from 'react'
import stl from './BulkPlayerForm.module.scss'

const emptyPlayer = {
  fullName: '',
  phone_number: '',
  email: '',
  skill_type: 'INTERMEDIATE',
  checked_in: false
}

const BulkPlayerForm = ({ onSubmit, onClose }) => {
  const [players, setPlayers] = useState([{ ...emptyPlayer }])

  const addRow = () => {
    setPlayers([...players, { ...emptyPlayer }])
  }

  const removeRow = (index) => {
    const newPlayers = players.filter((_, i) => i !== index)
    setPlayers(newPlayers)
  }

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setPlayers(newPlayers)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const formattedPlayers = players.map(player => {
      const nameParts = player.fullName.trim().split(/\s+/)
      return {
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' '),
        phone_number: player.phone_number,
        email: player.email,
        skill_type: player.skill_type,
        checked_in: player.checked_in
      }
    }).filter(player => player.first_name) // Only submit players with at least a first name

    onSubmit(formattedPlayers)
  }

  return (
    <div className={stl.overlay}>
      <div className={stl.modal}>
        <div className={stl.header}>
          <h2>Add Multiple Players</h2>
          <button className={stl.closeButton} onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className={stl.form}>
          <div className={stl.tableContainer}>
            <table className={stl.table}>
              <thead>
                <tr>
                  <th>Player Name *</th>
                  <th>Phone Number</th>
                  <th>Email</th>
                  <th>Skill Level</th>
                  <th>Checked In</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        placeholder="Enter full name"
                        value={player.fullName}
                        onChange={(e) => updatePlayer(index, 'fullName', e.target.value)}
                        required
                      />
                    </td>
                    <td>
                      <input
                        placeholder="Phone Number"
                        value={player.phone_number}
                        onChange={(e) => updatePlayer(index, 'phone_number', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="email"
                        placeholder="Email"
                        value={player.email}
                        onChange={(e) => updatePlayer(index, 'email', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        value={player.skill_type}
                        onChange={(e) => updatePlayer(index, 'skill_type', e.target.value)}
                      >
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={player.checked_in}
                        onChange={(e) => updatePlayer(index, 'checked_in', e.target.checked)}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className={stl.removeButton}
                        onClick={() => removeRow(index)}
                        disabled={players.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={stl.actions}>
            <button type="button" className={stl.addRowButton} onClick={addRow}>
              Add Row
            </button>
          </div>
          <div className={stl.buttons}>
            <button type="submit" className={stl.submitButton}>
              Add Players
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

export default BulkPlayerForm 