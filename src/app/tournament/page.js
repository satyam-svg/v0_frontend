'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const TournamentPage = () => {
  const router = useRouter()

  useEffect(() => {
    router.push('/')
  }, [router])

  return null
}

export default TournamentPage