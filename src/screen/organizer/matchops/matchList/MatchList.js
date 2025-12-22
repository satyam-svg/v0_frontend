'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import stl from './MatchList.module.scss';
import { endpoints } from '@/store/urls';
import toast from 'react-hot-toast';

const MatchList = () => {
    const router = useRouter();
    const [matches, setMatches] = useState([]);
    const [courts, setCourts] = useState({});
    const [selectedMatches, setSelectedMatches] = useState([]);
    const [selectedCourt, setSelectedCourt] = useState('');
    const [tournamentId, setTournamentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [numberOfCourts, setNumberOfCourts] = useState(0);

    useEffect(() => {
        if (tournamentId) {
            fetchMatches();
            fetchTournamentDetails();
        }
    }, [tournamentId]);

    const fetchTournamentDetails = async () => {
        try {
            const response = await fetch(`${endpoints.getTournamentDetails}?tournament_id=${tournamentId}`);
            const data = await response.json();
            if (response.ok) {
                setNumberOfCourts(data.numberOfCourts || 0);
            } else {
                toast.error(data.error || 'Failed to fetch tournament details');
            }
        } catch (error) {
            console.error('Error fetching tournament details:', error);
            toast.error('Failed to fetch tournament details');
        }
    };

    const fetchMatches = async () => {
        try {
            const response = await fetch(`${endpoints.getMatches}?tournament_id=${tournamentId}`);
            const data = await response.json();
            if (response.ok) {
                setMatches(data.matches || []);
                setCourts(data.courtAssignments || {});
            } else {
                toast.error(data.error || 'Failed to fetch matches');
            }
        } catch (error) {
            console.error('Error fetching matches:', error);
            toast.error('Failed to fetch matches');
        }
    };

    const handleMatchSelect = (matchId) => {
        setSelectedMatches(prev => {
            if (prev.includes(matchId)) {
                return prev.filter(id => id !== matchId);
            }
            return [...prev, matchId];
        });
    };

    const handleCourtAssignment = async () => {
        if (!selectedCourt || selectedMatches.length === 0) {
            toast.error('Please select both court and matches');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(endpoints.assignCourt, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tournament_id: tournamentId,
                    court_number: selectedCourt,
                    match_ids: selectedMatches,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Court assigned successfully');
                fetchMatches(); // Refresh the matches and court assignments
                setSelectedMatches([]);
                setSelectedCourt('');
            } else {
                toast.error(data.error || 'Failed to assign court');
            }
        } catch (error) {
            console.error('Error assigning court:', error);
            toast.error('Failed to assign court');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={stl.matchListContainer}>
            <h1>Match Management</h1>
            
            {/* Tournament ID Input */}
            <div className={stl.tournamentInput}>
                <input
                    type="text"
                    placeholder="Enter Tournament ID"
                    value={tournamentId}
                    onChange={(e) => setTournamentId(e.target.value)}
                />
                <button onClick={fetchMatches}>Load Matches</button>
            </div>

            {/* Court Assignment Section */}
            {numberOfCourts > 0 && (
                <div className={stl.courtAssignment}>
                    <h2>Court Assignment</h2>
                    <div className={stl.courtSelector}>
                        <select
                            value={selectedCourt}
                            onChange={(e) => setSelectedCourt(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Select Court</option>
                            {[...Array(numberOfCourts)].map((_, i) => (
                                <option key={i + 1} value={i + 1}>
                                    Court {i + 1}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleCourtAssignment}
                            disabled={loading || selectedMatches.length === 0 || !selectedCourt}
                        >
                            Assign Court
                        </button>
                    </div>
                </div>
            )}

            {/* Matches List */}
            <div className={stl.matchesContainer}>
                <div className={stl.matchesList}>
                    <h2>Available Matches</h2>
                    {matches.map((match) => (
                        <div
                            key={match.id}
                            className={`${stl.matchItem} ${
                                selectedMatches.includes(match.id) ? stl.selected : ''
                            }`}
                            onClick={() => handleMatchSelect(match.id)}
                        >
                            <div className={stl.matchInfo}>
                                <span>{match.team1} vs {match.team2}</span>
                                <span className={stl.roundInfo}>Round: {match.round}</span>
                            </div>
                            {courts[match.id] && (
                                <div className={stl.courtAssigned}>
                                    Court {courts[match.id]}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Court View */}
                <div className={stl.courtsView}>
                    <h2>Courts Overview</h2>
                    <div className={stl.courtsGrid}>
                        {[...Array(numberOfCourts)].map((_, i) => (
                            <div key={i + 1} className={stl.courtCard}>
                                <h3>Court {i + 1}</h3>
                                <div className={stl.courtMatches}>
                                    {matches
                                        .filter(match => courts[match.id] === (i + 1))
                                        .map(match => (
                                            <div key={match.id} className={stl.courtMatch}>
                                                {match.team1} vs {match.team2}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <button
                className={stl.backButton}
                onClick={() => router.push('/organizer/match-ops')}
            >
                Back to Match Ops
            </button>
        </div>
    );
};

export default MatchList;
