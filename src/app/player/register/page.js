'use client';

import { Suspense } from 'react';
import RegistrationForm from '@/components/player/registration/RegistrationForm';

export default function PlayerRegistrationPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationForm />
    </Suspense>
  );
}
