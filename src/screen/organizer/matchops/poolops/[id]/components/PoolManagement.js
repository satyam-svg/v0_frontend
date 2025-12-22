'use client'

import { useState, useEffect } from 'react';
import { endpoints } from '@/store/urls';
import { apiCall } from '@/store/utils';
import toast from 'react-hot-toast';
import stl from './PoolManagement.module.scss';
import { Tabs, Tab, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PoolTabs from './PoolTabs';
import TeamsList from './TeamsList';
import PoolFixtures from './PoolFixtures';
import AddPoolDialog from './AddPoolDialog';
import AddTeamDialog from './AddTeamDialog';
import EditTeamDialog from './EditTeamDialog';
import PlayerInfoDialog from './PlayerInfoDialog';
import AddWildcardDialog from './AddWildcardDialog';

const PoolManagement = ({ tournamentId, superTournamentId, format }) => {
    const [pools, setPools] = useState([]);
    const [selectedPool, setSelectedPool] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddPool, setShowAddPool] = useState(false);
    const [showAddTeam, setShowAddTeam] = useState(false);
    const [showEditTeam, setShowEditTeam] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [showPlayerInfo, setShowPlayerInfo] = useState(null);
    const [showAddWildcard, setShowAddWildcard] = useState(false);

    const fetchPools = async () => {
        try {
            setLoading(true);
            const response = await apiCall(`${endpoints.matchOps}/pools?tournament_id=${tournamentId}`);
            if (response.error) {
                throw new Error(response.error);
            }
            setPools(response.pools || []);
            // Select the first pool by default if available
            if (response.pools?.length > 0 && !selectedPool) {
                setSelectedPool(response.pools[0].name);
            }
        } catch (error) {
            console.error('Error fetching pools:', error);
            toast.error(error.message || 'Failed to fetch pools');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tournamentId) {
            fetchPools();
        }
    }, [tournamentId]);

    const handleAddPool = async (poolName) => {
        try {
            if (!poolName.trim()) {
                toast.error('Pool name is required');
                return;
            }

            if (poolName.includes(' ')) {
                toast.error('Pool name cannot contain spaces');
                return;
            }

            const response = await apiCall(`${endpoints.matchOps}/pools`, {
                method: 'POST',
                body: {
                    tournament_id: tournamentId,
                    pool_name: poolName.trim()
                }
            });

            if (response.error) {
                throw new Error(response.error);
            }

            toast.success('Pool created successfully');
            setShowAddPool(false);
            fetchPools();
        } catch (error) {
            console.error('Error creating pool:', error);
            toast.error(error.message || 'Failed to create pool');
        }
    };

    const handleDeletePool = async (poolName) => {
        if (!confirm(`Are you sure you want to delete pool ${poolName}? This will remove all associated matches and scores.`)) return;

        try {
            const response = await apiCall(`${endpoints.matchOps}/pools/${poolName}`, {
                method: 'DELETE',
                params: { tournament_id: tournamentId }
            });

            if (response.error) {
                throw new Error(response.error);
            }

            toast.success(`Pool ${poolName} deleted successfully`);
            fetchPools();
            if (selectedPool === poolName) {
                setSelectedPool(pools.find(p => p.name !== poolName)?.name || null);
            }
        } catch (error) {
            console.error('Error deleting pool:', error);
            toast.error(error.message || 'Failed to delete pool');
        }
    };

    const handleAddTeam = async (teamData) => {
        try {
            if (!selectedPool) return;

            const response = await apiCall(`${endpoints.matchOps}/pools/${selectedPool}/teams`, {
                method: 'POST',
                body: {
                    tournament_id: tournamentId,
                    teams: [{
                        team_name: format === 'singles' ? teamData.player1.name.trim() : (teamData.team_name.trim() || undefined),
                        player1: {
                            name: teamData.player1.name.trim(),
                            phone_number: teamData.player1.phone_number.trim() || undefined,
                            skill_type: teamData.player1.skill_type || undefined
                        },
                        ...(format !== 'singles' && {
                            player2: {
                                name: teamData.player2.name.trim(),
                                phone_number: teamData.player2.phone_number.trim() || undefined,
                                skill_type: teamData.player2.skill_type || undefined
                            }
                        })
                    }]
                }
            });

            if (response.error) {
                throw new Error(response.error);
            }

            toast.success('Team added successfully');
            setShowAddTeam(false);
            fetchPools();
        } catch (error) {
            console.error('Error adding team:', error);
            toast.error(error.message || 'Failed to add team');
        }
    };

    const handleGenerateFixtures = async () => {
        try {
            const response = await apiCall(`${endpoints.matchOps}/pools/${selectedPool}/fixtures`, {
                method: 'POST',
                body: {
                    tournament_id: tournamentId
                }
            });

            if (response.error) {
                throw new Error(response.error);
            }

            toast.success('Fixtures generated successfully');
            fetchPools();
        } catch (error) {
            console.error('Error generating fixtures:', error);
            toast.error(error.message || 'Failed to generate fixtures');
        }
    };

    const handleEditTeam = (team) => {
        setSelectedTeam(team);
        setShowEditTeam(true);
    };

    const handleUpdateTeam = async (updatedTeam) => {
        try {
            if (!selectedPool || !selectedTeam) return;

            const response = await apiCall(`${endpoints.matchOps}/pools/${selectedPool}/teams/${selectedTeam.team_id}`, {
                method: 'PUT',
                body: {
                    tournament_id: tournamentId,
                    team_name: format === 'singles' ? updatedTeam.player1.name.trim() : (updatedTeam.team_name.trim() || undefined),
                    player1: {
                        name: updatedTeam.player1.name.trim(),
                        phone_number: updatedTeam.player1.phone_number.trim() || undefined,
                        skill_type: updatedTeam.player1.skill_type || undefined
                    },
                    ...(format !== 'singles' && {
                        player2: {
                            name: updatedTeam.player2.name.trim(),
                            phone_number: updatedTeam.player2.phone_number.trim() || undefined,
                            skill_type: updatedTeam.player2.skill_type || undefined
                        }
                    })
                }
            });

            if (response.error) {
                throw new Error(response.error);
            }

            toast.success('Team updated successfully');
            setShowEditTeam(false);
            setSelectedTeam(null);
            fetchPools();
        } catch (error) {
            console.error('Error updating team:', error);
            toast.error(error.message || 'Failed to update team');
        }
    };

    const handleAddWildcard = async (teamsData) => {
        try {
            if (!selectedPool) return;

            const response = await apiCall(`${endpoints.matchOps}/pools/${selectedPool}/wildcard`, {
                method: 'POST',
                body: {
                    tournament_id: tournamentId,
                    teams: teamsData.map(team => ({
                        team_name: format === 'singles' ? team.player1.name.trim() : (team.team_name.trim() || undefined),
                        player1: {
                            name: team.player1.name.trim(),
                            phone_number: team.player1.phone_number.trim() || undefined,
                            skill_type: team.player1.skill_type || undefined
                        },
                        ...(format !== 'singles' && {
                            player2: {
                                name: team.player2.name.trim(),
                                phone_number: team.player2.phone_number.trim() || undefined,
                                skill_type: team.player2.skill_type || undefined
                            }
                        })
                    }))
                }
            });

            if (response.error) {
                throw new Error(response.error);
            }

            toast.success('Wildcard teams added successfully');
            setShowAddWildcard(false);
            fetchPools();
        } catch (error) {
            console.error('Error adding wildcard teams:', error);
            toast.error(error.message || 'Failed to add wildcard teams');
        }
    };

    if (loading) {
        return <div className={stl.loading}>Loading pools...</div>;
    }

    const selectedPoolData = pools.find(pool => pool.name === selectedPool);

    return (
        <div className={stl.poolManagement}>
            <div className={stl.header}>
                <PoolTabs
                    pools={pools}
                    selectedPool={selectedPool}
                    onSelectPool={setSelectedPool}
                />
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddPool(true)}
                >
                    Add Pool
                </Button>
            </div>

            <div className={stl.content}>
                <div className={stl.teamsSection}>
                    <TeamsList
                        pool={selectedPoolData}
                        onAddTeam={() => setShowAddTeam(true)}
                        onAddWildcard={() => setShowAddWildcard(true)}
                        onEditTeam={handleEditTeam}
                        onShowPlayerInfo={setShowPlayerInfo}
                        isSingles={format === 'singles'}
                        tournamentId={tournamentId}
                        onTeamsChange={fetchPools}
                    />
                </div>
                <div className={stl.fixturesSection}>
                    <PoolFixtures
                        pool={selectedPoolData}
                        tournamentId={tournamentId}
                        onFixturesChange={fetchPools}
                        isSingles={format === 'singles'}
                    />
                </div>
            </div>

            <AddPoolDialog
                open={showAddPool}
                onClose={() => setShowAddPool(false)}
                onAdd={handleAddPool}
            />

            <AddTeamDialog
                open={showAddTeam}
                onClose={() => setShowAddTeam(false)}
                onAdd={handleAddTeam}
                isSingles={format === 'singles'}
                tournamentId={tournamentId}
                superTournamentId={superTournamentId}
            />

            <EditTeamDialog
                open={showEditTeam}
                onClose={() => {
                    setShowEditTeam(false);
                    setSelectedTeam(null);
                }}
                onSave={handleUpdateTeam}
                team={selectedTeam}
                isSingles={format === 'singles'}
                tournamentId={tournamentId}
                superTournamentId={superTournamentId}
            />

            <PlayerInfoDialog
                player={showPlayerInfo}
                onClose={() => setShowPlayerInfo(null)}
            />

            <AddWildcardDialog
                open={showAddWildcard}
                onClose={() => setShowAddWildcard(false)}
                onAdd={handleAddWildcard}
                isSingles={format === 'singles'}
                tournamentId={tournamentId}
                superTournamentId={superTournamentId}
            />
        </div>
    );
};

export default PoolManagement; 