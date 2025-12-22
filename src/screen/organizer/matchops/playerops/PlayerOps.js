'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import stl from './PlayerOps.module.scss'

const PlayerOps = () => {
  const router = useRouter()
  const [tournamentId, setTournamentId] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (tournamentId) {
      router.push(`/organizer/match-ops/player-ops/${tournamentId}`)
    }
  }

  const handleBack = () => {
    router.push('/organizer/match-ops')
  }

  return (
    <div className={stl.container}>
      <div className={stl.content}>
        <form onSubmit={handleSubmit} className={stl.form}>
          <h1>Player Management</h1>
          <div className={stl.formGroup}>
            <label htmlFor="tournamentId">Tournament ID</label>
            <input
              id="tournamentId"
              type="text"
              value={tournamentId}
              onChange={(e) => setTournamentId(e.target.value)}
              placeholder="Enter Tournament ID"
              className={stl.inputField}
              required
            />
          </div>
          <button type="submit" className={stl.submitButton}>
            Continue
          </button>
          <button type="button" className={stl.buttonBack} onClick={handleBack}>
            Go Back
          </button>
        </form>
      </div>
    </div>
  )
}

export default PlayerOps 