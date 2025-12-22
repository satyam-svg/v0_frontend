import { Suspense } from 'react';
import DexterCheckinWrapper from "./DexterCheckinWrapper";

function DexterCheckinPage({ params }) {
  // Validate and parse the tournament ID
  const tournamentId = params?.tid;
  
  if (!tournamentId) {
    return <div>Invalid tournament ID</div>;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DexterCheckinWrapper tournamentId={tournamentId} />
    </Suspense>
  );
}

// Add metadata export for better SEO
export async function generateMetadata({ params }) {
  return {
    title: `Player Check-in | Tournament ${params.tid}`,
    description: 'Player check-in page for Dexter Capital Pickleball Tournament'
  };
}

export default DexterCheckinPage; 