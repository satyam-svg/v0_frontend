'use client'
import { Suspense } from 'react';
import PlayerCheckin from "@/screen/tournament/playerCheckin/PlayerCheckin";

function PlayerCheckinPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PlayerCheckin />
    </Suspense>
  );
}

export default PlayerCheckinPage; 