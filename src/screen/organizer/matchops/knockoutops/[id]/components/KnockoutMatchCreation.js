'use client'

import { useState, useEffect } from 'react';
import { endpoints } from '@/store/urls';
import { apiCall } from '@/store/utils';
import toast from 'react-hot-toast';
import stl from './KnockoutMatchCreation.module.scss';
import { Button, FormControl, InputLabel, TextField, Autocomplete } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import KnockoutBracket2 from '@/components/fixtures/KnockoutBracket2';

const KnockoutMatchCreation = ({ tournamentId }) => {
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [knockoutExists, setKnockoutExists] = useState(false);
    const [knockoutInfo, setKnockoutInfo] = useState(null);
    const [knockoutMatches, setKnockoutMatches] = useState([]);

    // Fetch knockout matches
    const fetchKnockoutMatches = async () => {
        try {
            const response = await apiCall(`${endpoints.getFixtures}?tournament_id=${tournamentId}`);
            if (response && response.matches) {
                const knockoutMatchesArray = response.matches.filter(match => match.pool === 'knockout');
                setKnockoutMatches(knockoutMatchesArray);
            }
        } catch (error) {
            console.error('Error fetching knockout matches:', error);
            toast.error('Failed to fetch knockout matches');
        }
    };

    // Check if knockout bracket exists
    const checkKnockoutExists = async () => {
        try {
            const response = await apiCall(`${endpoints.checkKnockout}/${tournamentId}`);
            setKnockoutExists(response.exists);
            if (response.exists) {
                setKnockoutInfo(response);
                await fetchKnockoutMatches(); // Fetch matches if knockout exists
            }
        } catch (error) {
            console.error('Error checking knockout existence:', error);
            toast.error('Failed to check knockout status');
        }
    };

    // Delete existing knockout bracket
    const handleDeleteKnockout = async () => {
        if (!confirm('Are you sure you want to delete the existing knockout bracket? This action cannot be undone.')) {
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiCall(`${endpoints.deleteKnockout}/${tournamentId}`, {
                method: 'DELETE'
            });

            toast.success('Knockout bracket deleted successfully');
            setKnockoutExists(false);
            setKnockoutInfo(null);
        } catch (error) {
            console.error('Error deleting knockout bracket:', error);
            toast.error(error.message || 'Failed to delete knockout bracket');
        } finally {
            setSubmitting(false);
        }
    };

    // Fetch teams and check knockout existence on component mount
    useEffect(() => {
        if (tournamentId) {
            Promise.all([fetchTeams(), checkKnockoutExists()]);
        }
    }, [tournamentId]);

    // Fetch all teams from pools
    const fetchTeams = async () => {
        try {
            setLoading(true);
            const response = await apiCall(`${endpoints.matchOps}/pools?tournament_id=${tournamentId}`);
            if (response.error) {
                throw new Error(response.error);
            }

            // Extract teams from all pools and format them
            const allTeams = response.pools.reduce((acc, pool) => {
                const poolTeams = pool.teams.map(team => {
                    const playerNames = `${team.player1.name} / ${team.player2.name}`;
                    return {
                        ...team,
                        displayName: `${playerNames} [${team.team_name}]`,
                        searchText: `${team.team_name} ${playerNames}`.toLowerCase()
                    };
                });
                return [...acc, ...poolTeams];
            }, []);

            setTeams(allTeams);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error(error.message || 'Failed to fetch teams');
        } finally {
            setLoading(false);
        }
    };

    const handleAddMatch = () => {
        if (matches.length >= 16) {
            toast.error('Maximum 16 matches allowed');
            return;
        }

        setMatches([...matches, { team1_id: null, team2_id: null }]);
    };

    const handleTeamChange = (matchIndex, teamNumber, newTeam) => {
        const newMatches = [...matches];
        if (teamNumber === 1) {
            newMatches[matchIndex].team1_id = newTeam?.team_id || null;
        } else {
            newMatches[matchIndex].team2_id = newTeam?.team_id || null;
        }
        setMatches(newMatches);
    };

    const handleRemoveMatch = (index) => {
        const newMatches = matches.filter((_, i) => i !== index);
        setMatches(newMatches);
    };

    const isTeamUsed = (teamId, currentMatchIndex) => {
        return matches.some((match, idx) => 
            idx !== currentMatchIndex && 
            (match.team1_id === teamId || match.team2_id === teamId)
        );
    };

    const getAvailableTeams = (matchIndex, excludeTeamId = null) => {
        return teams.filter(team => 
            !isTeamUsed(team.team_id, matchIndex) && 
            team.team_id !== excludeTeamId
        );
    };

    const handleGenerateKnockout = async () => {
        // Validate matches
        const validMatchCounts = [2, 4, 8, 16];
        if (!validMatchCounts.includes(matches.length)) {
            toast.error('Please add 2, 4, 8, or 16 matches');
            return;
        }

        const invalidMatches = matches.some(match => !match.team1_id || !match.team2_id);
        if (invalidMatches) {
            toast.error('Please select teams for all matches');
            return;
        }

        // Confirm with user
        if (!confirm('Are you sure you want to generate the knockout bracket? This action cannot be undone.')) {
            return;
        }

        try {
            setSubmitting(true);
            const response = await apiCall(endpoints.knockoutFromMatches, {
                method: 'POST',
                body: {
                    tournament_id: tournamentId,
                    matches: matches.map(match => ({
                        team1_id: match.team1_id,
                        team2_id: match.team2_id
                    }))
                }
            });

            if (response.error) {
                throw new Error(response.error);
            }

            toast.success('Knockout bracket generated successfully');
            setMatches([]); // Clear matches after successful generation
            await checkKnockoutExists(); // Refresh knockout status
        } catch (error) {
            console.error('Error generating knockout bracket:', error);
            toast.error(error.message || 'Failed to generate knockout bracket');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className={stl.loading}>Loading teams...</div>;
    }

    return (
        <div className={stl.knockoutMatchCreation}>
            <div className={stl.header}>
                <h2>Create Knockout Matches</h2>
                {knockoutExists && (
                    <div className={stl.knockoutInfo}>
                        <div className={stl.infoText}>
                            <p>A knockout bracket already exists for this tournament.</p>
                            <p>Total Matches: {knockoutInfo?.total_matches}</p>
                            <p>Rounds: {knockoutInfo?.rounds?.join(', ')}</p>
                        </div>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDeleteKnockout}
                            disabled={submitting}
                        >
                            Delete Existing Bracket
                        </Button>
                    </div>
                )}
            </div>

            {knockoutExists ? (
                <div className={stl.existingBracket}>
                    {knockoutMatches.length > 0 ? (
                        <KnockoutBracket2 matches={knockoutMatches} />
                    ) : (
                        <div className={stl.loading}>Loading bracket...</div>
                    )}
                </div>
            ) : (
                <>
                    <div className={stl.matchesList}>
                        {matches.map((match, index) => (
                            <div key={index} className={stl.matchItem}>
                                <div className={stl.matchNumber}>Match {index + 1}</div>
                                <div className={stl.matchTeams}>
                                    <FormControl className={stl.teamSelect}>
                                        <Autocomplete
                                            value={teams.find(t => t.team_id === match.team1_id) || null}
                                            onChange={(_, newValue) => handleTeamChange(index, 1, newValue)}
                                            options={getAvailableTeams(index, match.team2_id)}
                                            getOptionLabel={(option) => option.displayName}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Team 1" 
                                                    placeholder="Search by team or player name"
                                                />
                                            )}
                                            filterOptions={(options, { inputValue }) => {
                                                const searchText = inputValue.toLowerCase();
                                                return options.filter(option => 
                                                    option.searchText.includes(searchText)
                                                );
                                            }}
                                        />
                                    </FormControl>

                                    <span className={stl.vs}>vs</span>

                                    <FormControl className={stl.teamSelect}>
                                        <Autocomplete
                                            value={teams.find(t => t.team_id === match.team2_id) || null}
                                            onChange={(_, newValue) => handleTeamChange(index, 2, newValue)}
                                            options={getAvailableTeams(index, match.team1_id)}
                                            getOptionLabel={(option) => option.displayName}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Team 2" 
                                                    placeholder="Search by team or player name"
                                                />
                                            )}
                                            filterOptions={(options, { inputValue }) => {
                                                const searchText = inputValue.toLowerCase();
                                                return options.filter(option => 
                                                    option.searchText.includes(searchText)
                                                );
                                            }}
                                        />
                                    </FormControl>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        onClick={() => handleRemoveMatch(index)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className={stl.actions}>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={handleAddMatch}
                            disabled={matches.length >= 16}
                            sx={{ mr: 2 }}
                        >
                            Add Match
                        </Button>
                        {matches.length > 0 && (
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGenerateKnockout}
                                disabled={![2, 4, 8, 16].includes(matches.length) || submitting || matches.some(match => !match.team1_id || !match.team2_id)}
                            >
                                Generate Knockout Bracket
                            </Button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default KnockoutMatchCreation; 