'use client'

import { MatchOverlay } from '@/components/matchOverlay';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OverlayContent() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournament');
  const matchId = searchParams.get('match');

  if (!tournamentId || !matchId) {
    return <div>Missing tournament or match ID</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <MatchOverlay matchId={matchId} tournamentId={tournamentId} />
    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OverlayContent />
    </Suspense>
  );
} 