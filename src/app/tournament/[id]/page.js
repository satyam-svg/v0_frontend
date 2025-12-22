'use client'
import { TournamentScreen } from "@/screen/tournament"
import { use } from 'react'

const TournamentPage = ({ params }) => {
  const resolvedParams = use(params)
  return (
    <div>
      <TournamentScreen id={resolvedParams.id} />
    </div>
  )
}

export default TournamentPage 