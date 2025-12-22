'use client';

import { MatchScreen } from "@/screen/referee/match";
import { useParams } from "next/navigation";

const RefereeMatchPage = () => {
  const params = useParams();
  return <MatchScreen tournamentId={params.id} matchId={params.matchId} />;
};


export default RefereeMatchPage; 