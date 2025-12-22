'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import stl from './PlayerOpsDetail.module.scss'
import PlayerForm from './components/PlayerForm'
import PlayersTable from './components/PlayersTable'
import { endpoints } from '@/store/urls'
import { apiCall } from '@/store/utils'
import toast from 'react-hot-toast'
import BulkPlayerForm from './components/BulkPlayerForm'

const PlayerOpsDetail = () => {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [players, setPlayers] = useState([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isBulkAddDialogOpen, setIsBulkAddDialogOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const fetchPlayers = async () => {
    try {
      const response = await apiCall(endpoints.getPlayers, {
        params: { super_tournament_id: params.id }
      })
      if (response.error) {
        throw new Error(response.error)
      }
      setPlayers(response)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching players:', error)
      const errorMessage = error.message || error.details || 'Failed to fetch players'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  useEffect(() => {
    if (params.id) {
      fetchPlayers()
    }
  }, [params.id])

  const handleBack = () => {
    router.push('/organizer/match-ops/player-ops')
  }

  const handleAddPlayer = async (formData) => {
    try {
      const response = await apiCall(endpoints.addPlayers, {
        method: 'POST',
        body: {
          super_tournament_id: params.id,
          players: [formData],
        },
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      await fetchPlayers()
      setIsAddDialogOpen(false)
      toast.success('Player added successfully')
    } catch (error) {
      console.error('Error adding player:', error)
      const errorMessage = error.message || error.details || 'Failed to add player'
      toast.error(errorMessage)
    }
  }

  const handleUpdatePlayer = async (formData) => {
    try {
      const response = await apiCall(`${endpoints.updatePlayer}/${selectedPlayer.uuid}`, {
        method: 'PUT',
        body: {
          super_tournament_id: params.id,
          ...formData,
        },
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      await fetchPlayers()
      setIsEditDialogOpen(false)
      setSelectedPlayer(null)
      toast.success('Player updated successfully')
    } catch (error) {
      console.error('Error updating player:', error)
      const errorMessage = error.message || error.details || 'Failed to update player'
      toast.error(errorMessage)
    }
  }

  const handleDeletePlayer = async (uuid) => {
    if (!confirm('Are you sure you want to delete this player?')) return
    try {
      const response = await apiCall(`${endpoints.deletePlayer}/${uuid}`, {
        method: 'DELETE',
        params: { super_tournament_id: params.id }
      })
      
      if (response.error) {
        throw new Error(response.error)
      }
      
      await fetchPlayers()
      toast.success('Player deleted successfully')
    } catch (error) {
      console.error('Error deleting player:', error)
      const errorMessage = error.message || error.details || 'Failed to delete player'
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className={stl.container}>
        <div className={stl.content}>
          <div className={stl.loading}>Loading players...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={stl.container}>
        <div className={stl.content}>
          <div className={stl.error}>{error}</div>
          <button className={stl.buttonBack} onClick={handleBack}>
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={stl.container}>
      <div className={stl.content}>
        <div className={stl.header}>
          <h1>Player Management</h1>
          <div className={stl.actions}>
            <button
              className={stl.addButton}
              onClick={() => setIsAddDialogOpen(true)}
            >
              Add Player
            </button>
            <button
              className={stl.addButton}
              onClick={() => setIsBulkAddDialogOpen(true)}
            >
              Add Bulk
            </button>
            <button className={stl.backButton} onClick={handleBack}>
              Go Back
            </button>
          </div>
        </div>

        <PlayersTable
          players={players}
          onEdit={(player) => {
            setSelectedPlayer(player)
            setIsEditDialogOpen(true)
          }}
          onDelete={handleDeletePlayer}
        />
      </div>

      {isAddDialogOpen && (
        <PlayerForm
          onSubmit={handleAddPlayer}
          onClose={() => setIsAddDialogOpen(false)}
          mode="add"
        />
      )}

      {isEditDialogOpen && (
        <PlayerForm
          initialData={selectedPlayer}
          onSubmit={handleUpdatePlayer}
          onClose={() => {
            setIsEditDialogOpen(false)
            setSelectedPlayer(null)
          }}
          mode="edit"
        />
      )}

      {isBulkAddDialogOpen && (
        <BulkPlayerForm
          onSubmit={async (players) => {
            try {
              const response = await apiCall(endpoints.addPlayers, {
                method: 'POST',
                body: {
                  super_tournament_id: params.id,
                  players,
                },
              })
              
              if (response.error) {
                throw new Error(response.error)
              }
              
              await fetchPlayers()
              setIsBulkAddDialogOpen(false)
              toast.success('Players added successfully')
            } catch (error) {
              console.error('Error adding players:', error)
              const errorMessage = error.message || error.details || 'Failed to add players'
              toast.error(errorMessage)
            }
          }}
          onClose={() => setIsBulkAddDialogOpen(false)}
        />
      )}
    </div>
  )
}

export default PlayerOpsDetail 