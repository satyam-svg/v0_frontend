'use client'

import { useState, useEffect } from "react";
import { Tabs, Tab, Switch, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { apiCall } from "@/store/utils";
import { endpoints } from "@/store/urls";
import toast from "react-hot-toast";
import stl from "./KnockoutStandings.module.scss";
import KnockoutMatchCreation from "./KnockoutMatchCreation";

const KnockoutStandings = ({ tournamentId }) => {
    const [poolData, setPoolData] = useState(null);
    const [overallData, setOverallData] = useState(null);
    const [secondPlaceData, setSecondPlaceData] = useState(null);
    const [selectedPool, setSelectedPool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [standingsType, setStandingsType] = useState('pools');
    const [overallStandingsType, setOverallStandingsType] = useState('overall');
    const [poolError, setPoolError] = useState(null);
    const [overallError, setOverallError] = useState(null);
    const [secondPlaceError, setSecondPlaceError] = useState(null);

    // Fetch Pool Wise Standings
    const getPoolwiseStandings = async () => {
        setLoading(true);
        setPoolError(null);
        const url = `${endpoints.getPoolWiseStandings}/${tournamentId}`;
        try {
            const responseData = await apiCall(url);
            console.log("Received pool data:", responseData);
            setPoolData(responseData);
            // Set the first pool as selected by default
            if (responseData && Object.keys(responseData).length > 0) {
                const firstRound = Math.min(...Object.keys(responseData).map(Number));
                const firstPool = Object.keys(responseData[firstRound]?.pools || {})[0];
                setSelectedPool(firstPool);
            }
        } catch (error) {
            console.log("Failed to fetch pool-wise standings:", error.message);
            setPoolError(error.message || 'Failed to fetch pool standings');
            toast.error("Failed to fetch pool standings");
        } finally {
            setLoading(false);
        }
    };

    // Fetch Overall Standings
    const getOverallStandings = async () => {
        setLoading(true);
        setOverallError(null);
        const url = `${endpoints.getOverallStandings}/${tournamentId}`;
        try {
            const responseData = await apiCall(url);
            
            // Validate response structure
            if (!responseData || !Array.isArray(responseData.standings)) {
                throw new Error('Invalid response format from server');
            }
            
            setOverallData(responseData.standings);
        } catch (error) {
            console.error("Failed to fetch overall standings:", error);
            setOverallError(error.message || 'Failed to fetch overall standings');
            toast.error("Failed to fetch overall standings");
            setOverallData(null);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Second Place Standings
    const getSecondPlaceStandings = async () => {
        setLoading(true);
        setSecondPlaceError(null);
        const url = `${endpoints.getSecondPlaceStandings}/${tournamentId}`;
        try {
            const responseData = await apiCall(url);
            
            // Validate response structure
            if (!responseData || !Array.isArray(responseData.standings)) {
                throw new Error('Invalid response format from server');
            }
            
            setSecondPlaceData(responseData.standings);
        } catch (error) {
            console.error("Failed to fetch second place standings:", error);
            setSecondPlaceError(error.message || 'Failed to fetch second place standings');
            toast.error("Failed to fetch second place standings");
            setSecondPlaceData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (standingsType === 'pools') {
            getPoolwiseStandings();
        } else {
            if (overallStandingsType === 'overall') {
                getOverallStandings();
            } else {
                getSecondPlaceStandings();
            }
        }
    }, [tournamentId, standingsType, overallStandingsType]);

    // Get round 1 pools
    const getRoundOnePools = () => {
        if (!poolData) return [];
        const firstRound = Math.min(...Object.keys(poolData).map(Number));
        return Object.keys(poolData[firstRound]?.pools || {});
    };

    const renderPoolStandings = () => {
        if (!selectedPool) return null;

        const firstRound = Math.min(...Object.keys(poolData).map(Number));
        const roundData = poolData[firstRound];
        const poolTeams = roundData?.pools[selectedPool];

        if (!poolTeams) return null;

        return (
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
                    {poolTeams.map((team) => (
                        <tr key={team.team_id}>
                            <td data-label="Team">{team.team_id}</td>
                            <td data-label="Players" style={{ width: "200px" }}>
                                {team.players}
                            </td>
                            <td data-label="Played">{team.matches_played}</td>
                            <td data-label="Total Scores">{team.total_scores}</td>
                            <td data-label="Won">{team.matches_won}</td>
                            <td data-label="Lost">{team.matches_lost}</td>
                            <td data-label="Points Scored">{team.points_scored}</td>
                            <td data-label="Points Lost">{team.points_lost}</td>
                            <td data-label="Point Diff.">{team.points_difference}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const renderOverallStandings = () => {
        const data = overallStandingsType === 'overall' ? overallData : secondPlaceData;
        const error = overallStandingsType === 'overall' ? overallError : secondPlaceError;

        if (error) {
            return <div className={stl.error}>{error}</div>;
        }

        if (!data || data.length === 0) {
            return <div className={stl.error}>No {overallStandingsType === 'overall' ? 'overall' : 'second place'} standings available</div>;
        }

        return (
            <table className={stl.table}>
                <thead>
                    <tr>
                        <th>SL</th>
                        <th>Team</th>
                        <th>Players</th>
                        {overallStandingsType === 'secondPlace' && <th>Pool</th>}
                        <th>Played</th>
                        <th>Won</th>
                        <th>Lost</th>
                        <th>Win %</th>
                        <th>Points Scored</th>
                        <th>Points Lost</th>
                        <th>Point Diff.</th>
                        <th>Total Scores</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((team, index) => (
                        <tr key={team.team_id}>
                            <td data-label="slno">{index + 1}</td>
                            <td data-label="Team">{team.team_name}</td>
                            <td data-label="Players">{team.players}</td>
                            {overallStandingsType === 'secondPlace' && <td data-label="Pool">{team.pool}</td>}
                            <td data-label="Played">{team.matches_played}</td>
                            <td data-label="Won">{team.matches_won}</td>
                            <td data-label="Lost">{team.matches_lost}</td>
                            <td data-label="Win %">{team.win_percentage?.toFixed(1)}%</td>
                            <td data-label="Points Scored">{team.points_scored}</td>
                            <td data-label="Points Lost">{team.points_lost}</td>
                            <td data-label="Point Diff.">{team.points_difference}</td>
                            <td data-label="Total Scores">{team.total_scores}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    const roundOnePools = getRoundOnePools();

    const handleStandingsTypeChange = (e) => {
        const newType = e.target.checked ? 'overall' : 'pools';
        setStandingsType(newType);
        // Reset errors when switching views
        if (newType === 'pools') {
            setOverallError(null);
            setSecondPlaceError(null);
        } else {
            setPoolError(null);
        }
    };

    const handleOverallTypeChange = (event) => {
        setOverallStandingsType(event.target.value);
    };

    const renderContent = () => {
        if (loading) {
            return <div className={stl.loading}>Loading standings...</div>;
        }

        if (standingsType === 'pools') {
            if (poolError) {
                return <div className={stl.error}>{poolError}</div>;
            }
            if (!poolData || Object.keys(poolData).length === 0) {
                return <div className={stl.error}>No pool standings available</div>;
            }
            return renderPoolStandings();
        } else {
            return renderOverallStandings();
        }
    };

    return (
        <div className={stl.knockoutStandings}>
            <div className={stl.matchCreationSection}>
                <KnockoutMatchCreation tournamentId={tournamentId} />
            </div>

            <div className={stl.standingsSection}>
                <div className={stl.header}>
                    <div className={`${stl.headerContent} ${standingsType !== 'pools' ? stl.centered : ''}`}>
                        {standingsType === 'pools' && poolData && Object.keys(poolData).length > 0 && (
                            <div className={stl.poolTabs}>
                                <Tabs
                                    value={selectedPool}
                                    onChange={(_, newValue) => setSelectedPool(newValue)}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                    className={stl.tabs}
                                >
                                    {roundOnePools.map((pool) => (
                                        <Tab
                                            key={pool}
                                            label={isNaN(pool) ? pool : `Pool ${pool}`}
                                            value={pool}
                                        />
                                    ))}
                                </Tabs>
                            </div>
                        )}
                        <div className={stl.standingsControls}>
                            <div className={stl.standingsTypeSelector}>
                                <span 
                                    className={standingsType === 'pools' ? stl.activeLabel : ''}
                                    onClick={() => handleStandingsTypeChange({ target: { checked: false } })}
                                >
                                    Pool
                                </span>
                                <Switch
                                    checked={standingsType === 'overall'}
                                    onChange={handleStandingsTypeChange}
                                    color="primary"
                                    size="small"
                                />
                                <span 
                                    className={standingsType === 'overall' ? stl.activeLabel : ''}
                                    onClick={() => handleStandingsTypeChange({ target: { checked: true } })}
                                >
                                    Overall
                                </span>
                            </div>

                            {standingsType === 'overall' && (
                                <div className={stl.overallTypeSelector}>
                                    <RadioGroup
                                        row
                                        value={overallStandingsType}
                                        onChange={handleOverallTypeChange}
                                    >
                                        <FormControlLabel 
                                            value="overall" 
                                            control={<Radio size="small" />} 
                                            label="Overall" 
                                        />
                                        <FormControlLabel 
                                            value="secondPlace" 
                                            control={<Radio size="small" />} 
                                            label="2nd Place" 
                                        />
                                    </RadioGroup>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className={stl.standingsTable}>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default KnockoutStandings; 