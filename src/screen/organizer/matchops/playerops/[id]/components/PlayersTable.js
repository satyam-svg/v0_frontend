'use client'

import { useState } from 'react'
import stl from './PlayersTable.module.scss'

const PlayersTable = ({ players, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredPlayers = players.filter(player => {
    const fullName = `${player.first_name} ${player.last_name}`.toLowerCase()
    return fullName.includes(searchQuery.toLowerCase())
  })

  return (
    <div className={stl.tableWrapper}>
      <div className={stl.searchBar}>
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={stl.searchInput}
        />
      </div>
      <div className={stl.tableContainer}>
        <table className={stl.table}>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Skill Level</th>
              <th>Status</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map((player, index) => (
              <tr key={player.uuid}>
                <td>{index + 1}</td>
                <td>{`${player.first_name} ${player.last_name}`}</td>
                <td>{player.phone_number || '-'}</td>
                <td>{player.skill_type || 'INTERMEDIATE'}</td>
                <td>
                  <span className={`${stl.status} ${player.checked_in ? stl.checkedIn : stl.notCheckedIn}`}>
                    {player.checked_in ? 'Checked In' : 'Not Checked In'}
                  </span>
                </td>
                <td>{player.email || '-'}</td>
                <td className={stl.actions}>
                  <button
                    className={stl.editButton}
                    onClick={() => onEdit(player)}
                  >
                    Edit
                  </button>
                  <button
                    className={stl.deleteButton}
                    onClick={() => onDelete(player.uuid)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredPlayers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                  {searchQuery ? 'No matching players found' : 'No players found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PlayersTable 