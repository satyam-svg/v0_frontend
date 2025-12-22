'use client';

import { Matches } from "@/screen/referee/matches";
import { useParams } from "next/navigation";

const RefereeMatchesPage = () => {
  const params = useParams();
  return <Matches tournamentId={params.id} />;
};

export default RefereeMatchesPage; 