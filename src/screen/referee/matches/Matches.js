'use client'
import React, { useEffect, useState } from "react";
import stl from "./Matches.module.scss";
import { useRouter } from "next/navigation";
import { RefereeFixtures } from "@/components/fixtures";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { apiCall } from "@/store/utils";
import { endpoints } from "@/store/urls";
import { Details } from "@/components/details";
import { Header } from "@/components/header";
import { RefereeMatchTable } from "@/components/refereeMatchTable";

const Matches = ({ tournamentId }) => {
  const [activeTab, setActiveTab] = useState("scoring");
  const [tournamentDetails, setTournamentDetails] = useState(null);
  const [totalRounds, setTotalRounds] = useState(0);
  const router = useRouter();

  const renderContent = () => {
    switch (activeTab) {
      case "scoring":
        return <RefereeFixtures 
          tournamentId={tournamentId} 
          totalRounds={totalRounds} 
        />;
      case "table":
        return <RefereeMatchTable tournamentId={tournamentId} />;
      case "checkin":
        return <Details tournament_id={tournamentId} checkin />;
      default:
        return null;
    }
  };

  const getTournamentDetails = async (tournament_id) => {
    try {
      const url = endpoints.getTournamentDetails + `/${tournament_id}`;
      const data = await apiCall(url);
      setTournamentDetails(data);
      if (data?.teams?.length == 32) setTotalRounds(5);
      else if (data?.teams?.length == 16) setTotalRounds(4);
      else if (data?.teams?.length == 8) setTotalRounds(3);
      else setTotalRounds(4);
    } catch (error) {
      console.log("Failed to fetch details:", error.message);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      getTournamentDetails(tournamentId);
    }
  }, [tournamentId]);

  return (
    <div className={stl.screen}>
      {tournamentId ? (
        <>
          <Header details={tournamentDetails} />

          <div className={stl.tabs}>
            <button
              className={activeTab === "scoring" ? stl.activeTab : ""}
              onClick={() => setActiveTab("scoring")}
            >
              Scoring
            </button>
            <button
              className={activeTab === "table" ? stl.activeTab : ""}
              onClick={() => setActiveTab("table")}
            >
              Table
            </button>
            <button
              className={activeTab === "checkin" ? stl.activeTab : ""}
              onClick={() => setActiveTab("checkin")}
            >
              Check-in
            </button>
          </div>

          <div className={stl.content}>
            {renderContent()}
          </div>
        </>
      ) : (
        <header>
          <button onClick={() => (router.push("/referee"))}>
            <HomeOutlinedIcon style={{ color: 'white' }} />
          </button>
          <h1>Invalid Tournament ID</h1>
        </header>
      )}
    </div>
  );
};

export default Matches;
