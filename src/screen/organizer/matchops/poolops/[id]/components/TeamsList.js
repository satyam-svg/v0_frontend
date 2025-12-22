import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import { endpoints } from '@/store/urls';
import { apiCall } from '@/store/utils';
import toast from 'react-hot-toast';
import stl from './TeamsList.module.scss';

const TeamsList = ({ pool, onAddTeam, onAddWildcard, onShowPlayerInfo, onEditTeam, isSingles, tournamentId, onTeamsChange }) => {
    const handleDeleteTeam = async (teamId) => {
        if (!window.confirm(`Are you sure you want to delete this ${isSingles ? 'player' : 'team'}?`)) {
            return;
        }

        try {
            const response = await apiCall(`${endpoints.matchOps}/pools/${pool.name}/teams/${teamId}`, {
                method: 'DELETE',
                params: { tournament_id: tournamentId }
            });

            if (response.error) {
                throw new Error(response.error);
            }

            toast.success(`${isSingles ? 'Player' : 'Team'} deleted successfully`);
            onTeamsChange?.(); // Refresh the pool data
        } catch (error) {
            console.error('Error deleting team:', error);
            const errorMessage = error.message === 'Cannot delete team from pool with existing fixtures' 
                ? `Cannot delete ${isSingles ? 'player' : 'team'} from pool with existing fixtures`
                : error.message || `Failed to delete ${isSingles ? 'player' : 'team'}`;
            toast.error(errorMessage);
        }
    };

    if (!pool) {
        return (
            <div className={stl.noPool}>
                <p>Select a pool to view {isSingles ? 'players' : 'teams'}</p>
            </div>
        );
    }

    return (
        <div className={stl.teamsListContainer}>
            <div className={stl.header}>
                <h3>{isSingles ? 'Players' : 'Teams'}</h3>
                {pool.has_fixtures ? (
                    <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<SportsTennisIcon />}
                        onClick={onAddWildcard}
                        size="small"
                    >
                        Add Wildcard {isSingles ? 'Player' : 'Team'}
                    </Button>
                ) : (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={onAddTeam}
                        size="small"
                    >
                        Add {isSingles ? 'Player' : 'Team'}
                    </Button>
                )}
            </div>

            <div className={stl.teamsList}>
                {!pool.teams?.length ? (
                    <div className={stl.noTeams}>
                        <p>No {isSingles ? 'players' : 'teams'} in this pool</p>
                    </div>
                ) : (
                    pool.teams.map(team => (
                        <div key={team.team_id} className={stl.teamCard}>
                            <div className={stl.teamHeader}>
                                <h4>{team.team_name}</h4>
                                <div className={stl.actions}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<EditIcon />}
                                        onClick={() => onEditTeam?.(team)}
                                    >
                                        Edit
                                    </Button>
                                    {!pool.has_fixtures && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDeleteTeam(team.team_id)}
                                        >
                                            Delete
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className={stl.players}>
                                {[team.player1, ...(isSingles ? [] : [team.player2])].map((player, idx) => (
                                    player && (
                                        <div key={idx} className={stl.player}>
                                            <div className={stl.playerInfo}>
                                                <span className={stl.name}>{player.name}</span>
                                                {player.skill_type && (
                                                    <span className={stl.skill}>{player.skill_type}</span>
                                                )}
                                            </div>
                                            <Button
                                                size="small"
                                                onClick={() => onShowPlayerInfo(player)}
                                            >
                                                <InfoOutlinedIcon />
                                            </Button>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamsList; 