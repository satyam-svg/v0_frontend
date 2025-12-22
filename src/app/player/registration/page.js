import { Suspense } from 'react'
import PlayerRegistration from '@/screen/player/registration/PlayerRegistration'

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerRegistration />
    </Suspense>
  )
}