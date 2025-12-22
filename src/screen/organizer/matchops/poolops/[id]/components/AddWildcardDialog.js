import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    Autocomplete,
    Typography,
    Divider
} from '@mui/material';
import { endpoints } from '@/store/urls';
import { apiCall } from '@/store/utils';
import toast from 'react-hot-toast';
import stl from './AddWildcardDialog.module.scss';

const SKILL_LEVELS = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED'
};

const AddWildcardDialog = ({ open, onClose, onAdd, isSingles, tournamentId, superTournamentId }) => {
    const [teams, setTeams] = useState([
        {
            team_name: '',
            player1: null,
            player2: null
        },
        {
            team_name: '',
            player1: null,
            player2: null
        }
    ]);

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchPlayers = async () => {
        try {
            setLoading(true);
            const response = await apiCall(`${endpoints.getPlayers}?super_tournament_id=${superTournamentId}&checked_in=true`);
            if (response.error) {
                throw new Error(response.error);
            }
            // Filter out players who are part of any teams in any tournament
            const availablePlayers = response.filter(player => 
                player.teams.length === 0
            );
            setPlayers(availablePlayers);
        } catch (error) {
            console.error('Error fetching players:', error);
            toast.error('Failed to fetch players');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open && superTournamentId) {
            fetchPlayers();
        }
    }, [open, superTournamentId]);

    const handleClose = () => {
        setTeams([
            {
                team_name: '',
                player1: null,
                player2: null
            },
            {
                team_name: '',
                player1: null,
                player2: null
            }
        ]);
        onClose();
    };

    const handleSubmit = () => {
        const submissionData = teams.map(team => ({
            team_name: team.team_name,
            player1: {
                name: `${team.player1.first_name} ${team.player1.last_name}`,
                phone_number: team.player1.phone_number,
                skill_type: team.player1.skill_type
            },
            ...(isSingles ? {} : {
                player2: {
                    name: `${team.player2.first_name} ${team.player2.last_name}`,
                    phone_number: team.player2.phone_number,
                    skill_type: team.player2.skill_type
                }
            })
        }));
        onAdd(submissionData);
        handleClose();
    };

    // Get available players for player2 dropdown, excluding selected player1 and players selected in other teams
    const getPlayer2Options = (teamIndex) => {
        const selectedPlayers = teams.map(t => [t.player1?.uuid, t.player2?.uuid]).flat().filter(Boolean);
        return players.filter(player => 
            player.uuid !== teams[teamIndex].player1?.uuid && 
            !selectedPlayers.includes(player.uuid)
        );
    };

    // Get available players for player1 dropdown, excluding players selected in other teams
    const getPlayer1Options = (teamIndex) => {
        const selectedPlayers = teams
            .filter((_, idx) => idx !== teamIndex)
            .map(t => [t.player1?.uuid, t.player2?.uuid])
            .flat()
            .filter(Boolean);
        return players.filter(player => !selectedPlayers.includes(player.uuid));
    };

    const isValid = teams.every(team => 
        isSingles
            ? !!team.player1
            : !!team.player1 && !!team.player2
    );

    if (loading) {
        return (
            <Dialog open={open} onClose={handleClose}>
                <DialogContent>
                    <div className={stl.loading}>Loading players...</div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog 
            open={open} 
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
        >
            <DialogTitle>Add Wildcard {isSingles ? 'Players' : 'Teams'}</DialogTitle>
            <DialogContent>
                <div className={stl.wildcardForm}>
                    <Typography variant="body2" color="textSecondary" className={stl.note}>
                        Add exactly two {isSingles ? 'players' : 'teams'} to create a wildcard match
                    </Typography>

                    {teams.map((team, teamIndex) => (
                        <div key={teamIndex} className={stl.teamSection}>
                            <Typography variant="h6" className={stl.teamTitle}>
                                {isSingles ? `Player ${teamIndex + 1}` : `Team ${teamIndex + 1}`}
                            </Typography>
                            {!isSingles && (
                                <TextField
                                    margin="dense"
                                    label="Team Name (Optional)"
                                    helperText="If not provided, will be auto-generated as 'Team {ID}'"
                                    fullWidth
                                    value={team.team_name}
                                    onChange={(e) => {
                                        const newTeams = [...teams];
                                        newTeams[teamIndex].team_name = e.target.value;
                                        setTeams(newTeams);
                                    }}
                                />
                            )}
                            
                            <div className={stl.playersContainer}>
                                <div className={stl.playerInputs}>
                                    <h4>{isSingles ? 'Select Player' : 'Select Player 1'}</h4>
                                    <FormControl fullWidth margin="dense">
                                        <Autocomplete
                                            value={team.player1}
                                            onChange={(_, newValue) => {
                                                const newTeams = [...teams];
                                                newTeams[teamIndex].player1 = newValue;
                                                newTeams[teamIndex].player2 = null; // Reset player2 when player1 changes
                                                setTeams(newTeams);
                                            }}
                                            options={getPlayer1Options(teamIndex)}
                                            getOptionLabel={(option) => 
                                                option ? `${option.first_name} ${option.last_name}${option.skill_type ? ` - ${option.skill_type}` : ''}` : ''
                                            }
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Search Player"
                                                    placeholder="Start typing to search..."
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.uuid === value?.uuid}
                                            filterOptions={(options, { inputValue }) => {
                                                const searchTerm = inputValue.toLowerCase();
                                                return options.filter(option => 
                                                    `${option.first_name} ${option.last_name}`.toLowerCase().includes(searchTerm) ||
                                                    (option.skill_type && option.skill_type.toLowerCase().includes(searchTerm))
                                                );
                                            }}
                                        />
                                    </FormControl>
                                </div>

                                {!isSingles && (
                                    <div className={stl.playerInputs}>
                                        <h4>Select Player 2</h4>
                                        <FormControl fullWidth margin="dense">
                                            <Autocomplete
                                                value={team.player2}
                                                onChange={(_, newValue) => {
                                                    const newTeams = [...teams];
                                                    newTeams[teamIndex].player2 = newValue;
                                                    setTeams(newTeams);
                                                }}
                                                options={getPlayer2Options(teamIndex)}
                                                getOptionLabel={(option) => 
                                                    option ? `${option.first_name} ${option.last_name}${option.skill_type ? ` - ${option.skill_type}` : ''}` : ''
                                                }
                                                renderInput={(params) => (
                                                    <TextField 
                                                        {...params} 
                                                        label="Search Player"
                                                        placeholder="Start typing to search..."
                                                        disabled={!team.player1}
                                                    />
                                                )}
                                                disabled={!team.player1}
                                                isOptionEqualToValue={(option, value) => option.uuid === value?.uuid}
                                                filterOptions={(options, { inputValue }) => {
                                                    const searchTerm = inputValue.toLowerCase();
                                                    return options.filter(option => 
                                                        `${option.first_name} ${option.last_name}`.toLowerCase().includes(searchTerm) ||
                                                        (option.skill_type && option.skill_type.toLowerCase().includes(searchTerm))
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                    </div>
                                )}
                            </div>

                            {teamIndex === 0 && <Divider className={stl.divider} />}
                        </div>
                    ))}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    disabled={!isValid}
                >
                    Add {isSingles ? 'Players' : 'Teams'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddWildcardDialog; 