'use client'
import { use } from 'react';
import { SuperTournamentScreen } from "@/screen/superTournament";

const SuperTournamentPage = ({ params }) => {
  const resolvedParams = use(params);
  return <SuperTournamentScreen id={resolvedParams.id} />;
};

export default SuperTournamentPage; 