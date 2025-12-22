'use client'
import { useEffect, useState } from "react";
import { apiCall } from "@/store/utils";
import stl from "./Standings.module.scss";
import { endpoints } from "@/store/urls";

const labels = {
  2: ["Group Stage", "Final"],
  3: ["Group Stage", "Semi-Final", "Final"],
  4: ["Group Stage", "Quarter-Final", "Semi-Final", "Final"],
  5: ["Group Stage", "Round of 16", "Quarter-Final", "Semi-Final", "Final"],
};

const Standings = ({ tournamentId, totalRounds }) => {
  const [poolData, setPoolData] = useState(null);
  const [overallData, setOverallData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("pools");
  const roundLabels = labels[totalRounds] || labels[4];

  // Fetch Pool Wise Standings
  const getPoolwiseStandings = async () => {
    setLoading(true);
    const url = `${endpoints.getPoolWiseStandings}/${tournamentId}`;
    try {
      const responseData = await apiCall(url);
      console.log("Received pool data:", responseData);
      setPoolData(responseData);
    } catch (error) {
      console.log("Failed to fetch pool-wise standings:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Overall Standings
  const getOverallStandings = async () => {
    setLoading(true);
    const url = `${endpoints.getOverallStandings}/${tournamentId}`;
    try {
      const responseData = await apiCall(url);
      setOverallData(responseData.standings); // Extract standings from response
    } catch (error) {
      console.log("Failed to fetch overall standings:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTab === "overall") {
      getOverallStandings();
    } else if (selectedTab === "pools" || selectedTab === "knockouts") {
      getPoolwiseStandings();
    }
  }, [selectedTab]);

  // Render Pool Wise standings
  const renderPoolWise = (roundData, roundKey) => {
    console.log("Rendering pool wise data for round:", roundKey, roundData);
    if (!roundData || !roundData.pools) {
      console.log("No round data or pools available");
      return null;
    }

    return (
      <>
        {loading ? (
          <p>Loading...</p>
        ) : (
          roundData &&
          Object.keys(roundData?.pools).map((pool) => {
            console.log("Rendering pool:", pool, roundData.pools[pool]);
            return (
              <div key={pool}>
                {roundKey == 1 && (
                  <h3 className={stl.poolHeader}>
                    {isNaN(pool) ? pool : `Pool ${pool}`}
                  </h3>
                )}
                <table className={stl.table}>
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Players</th>
                      <th>Played</th>
                      <th>Total Scores</th>
                      <th>Won</th>
                      <th>Lost</th>
                      <th>Points Scored</th>
                      <th>Points Lost</th>
                      <th>Point Diff.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roundData.pools[pool]?.map((team) => (
                      <tr key={team.team_id}>
                        <td data-label="Team">{team.team_id}</td>
                        <td
                          data-label="Players"
                          style={{ width: "200px" }}
                        >
                          {team.players}
                        </td>
                        <td data-label="Played">{team.matches_played}</td>
                        <td data-label="Total Scores">{team.total_scores}</td>
                        <td data-label="Won">{team.matches_won}</td>
                        <td data-label="Lost">{team.matches_lost}</td>
                        <td data-label="Points Scored">
                          {team.points_scored}
                        </td>
                        <td data-label="Points Lost">{team.points_lost}</td>
                        <td data-label="Point Diff.">
                          {team.points_difference}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })
        )}
      </>
    );
  };

  // Render Knockout standings
  const renderKnockouts = () => {
    return (
      <>
        {loading ? (
          <p>Loading...</p>
        ) : (
          Object.keys(poolData)
            .filter((roundKey) => roundKey > 1) // Filter rounds > 1
            .map((roundKey) => (
              <div key={roundKey}>
                <h2 className={stl.roundHeader}>
                  {poolData[roundKey]?.round_name}
                </h2>
                {renderPoolWise(poolData[roundKey], roundKey)}
              </div>
            ))
        )}
      </>
    );
  };

  // Render Overall standings
  const renderOverall = () => {
    return (
      <>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className={stl.table}>
            <thead>
              <tr>
                <th>SL</th>
                <th>Team</th>
                <th>Players</th>
                <th>Total Points</th>
                <th>Point Diff.</th>
              </tr>
            </thead>
            <tbody>
              {overallData?.map((team, index) => (
                <tr key={team.team_id}>
                  <td data-label="slno">{index + 1}</td>
                  <td data-label="Team">{team.team_id}</td>
                  <td data-label="Players">{team.player_names}</td>
                  <td data-label="Total Points">{team.total_points}</td>
                  <td data-label="Point Diff.">
                    {team.points_difference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </>
    );
  };

  return (
    <div className={stl.tableContainer}>
      <div className={stl.tabs}>
        <button
          className={selectedTab === "pools" ? stl.activeTab : ""}
          onClick={() => setSelectedTab("pools")}
        >
          Pools
        </button>
        {poolData && Object.keys(poolData).length > 1 && (
          <button
            className={selectedTab === "knockouts" ? stl.activeTab : ""}
            onClick={() => setSelectedTab("knockouts")}
          >
            Knockouts
          </button>
        )}
        <button
          className={selectedTab === "overall" ? stl.activeTab : ""}
          onClick={() => setSelectedTab("overall")}
        >
          Overall
        </button>
      </div>
      {selectedTab === "pools" && (
        <>
          {loading ? (
            <p>Loading...</p>
          ) : !poolData ? (
            <p>No standings data available</p>
          ) : (
            (() => {
              const firstRound = Math.min(...Object.keys(poolData).map(Number));
              return renderPoolWise(poolData[firstRound], firstRound);
            })()
          )}
        </>
      )}
      {selectedTab === "knockouts" &&
        poolData &&
        Object.keys(poolData).length > 1 &&
        renderKnockouts()}
      {selectedTab === "overall" && overallData && renderOverall()}
    </div>
  );
};

export default Standings;
