'use client';

import React, { useState, useEffect } from 'react'
import { playerService } from '../../../services/playerService'
import styles from './PlayerRegistration.module.scss'
import { useSearchParams } from 'next/navigation'
import { Modal } from '../../../components/Modal' // Assuming you have a Modal component

const PlayerRegistration = () => {
  const searchParams = useSearchParams()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [registrationResult, setRegistrationResult] = useState(null)
  
  const [matchType, setMatchType] = useState('singles')
  const [formData, setFormData] = useState({
    tournament_id: '',
    match_type: 'singles',
    first_name: '',
    last_name: '',
    gender: '',
    age: '',
    mobile_number: '',
    email: '',
    skill_type: '',
    dupr_id: '',
    player2: {
      first_name: '',
      last_name: '',
      gender: '',
      mobile_number: '',
      email: '',
      skill_type: '',
      dupr_id: ''
    }
  })

  useEffect(() => {
    const tournamentId = searchParams.get('tournament')
    if (tournamentId) {
      setFormData(prev => ({
        ...prev,
        tournament_id: tournamentId
      }))
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age),
        tournament_id: parseInt(formData.tournament_id)
      }
      
      if (matchType === 'singles') {
        delete payload.player2
      }

      const response = await playerService.registerPlayer(payload)
      setRegistrationResult(response)
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Registration failed:', error)
      // You might want to show an error modal here
    }
  }

  const handleInputChange = (e, player2Field = false) => {
    const { name, value } = e.target
    if (player2Field) {
      setFormData(prev => ({
        ...prev,
        player2: {
          ...prev.player2,
          [name]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  return (
    <div className={styles.container}>
      <h1>Player Registration</h1>
      <form onSubmit={handleSubmit}>
        <select
          value={matchType}
          onChange={(e) => {
            setMatchType(e.target.value)
            setFormData(prev => ({ ...prev, match_type: e.target.value }))
          }}
        >
          <option value="singles">Singles</option>
          <option value="doubles">Doubles</option>
        </select>

        {/* Player 1 Fields */}
        <div className={styles.playerFields}>
          <h2>Player 1</h2>
          <input
            name="first_name"
            placeholder="First Name"
            value={formData.first_name}
            onChange={handleInputChange}
          />
          {/* Add other fields similarly */}
        </div>

        {/* Player 2 Fields (for doubles) */}
        {matchType === 'doubles' && (
          <div className={styles.playerFields}>
            <h2>Player 2</h2>
            <input
              name="first_name"
              placeholder="First Name"
              value={formData.player2.first_name}
              onChange={(e) => handleInputChange(e, true)}
            />
            {/* Add other fields similarly */}
          </div>
        )}

        <button className={styles.submitButton} type="submit">
          Register
        </button>
      </form>

      {showSuccessModal && (
        <Modal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
        >
          <div className={styles.successModal}>
            <h2>Registration Successful!</h2>
            <p>Your team has been successfully registered.</p>
            <p>Team ID: {registrationResult?.team_id}</p>
            <button className={styles.submitButton} onClick={() => setShowSuccessModal(false)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default PlayerRegistration 