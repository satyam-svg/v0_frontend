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
    Typography
} from '@mui/material';
import { endpoints } from '@/store/urls';
import { apiCall } from '@/store/utils';
import stl from './AddTeamDialog.module.scss';

const SKILL_LEVELS = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED'
};

const AddTeamDialog = ({ open, onClose, onAdd, isSingles, tournamentId, superTournamentId }) => {
    const [team, setTeam] = useState({
        team_name: '',
        player1: null,
        player2: null
    });

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
        setTeam({
            team_name: '',
            player1: null,
            player2: null
        });
        onClose();
    };

    const handleSubmit = () => {
        const submissionData = {
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
        };
        onAdd(submissionData);
        handleClose();
    };

    // Get available players for player2 dropdown
    const getPlayer2Options = () => {
        return players.filter(player => player.uuid !== team.player1?.uuid);
    };

    const isValid = isSingles 
        ? !!team.player1
        : !!team.player1 && !!team.player2;

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
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Add {isSingles ? 'Player' : 'Team'} to Pool</DialogTitle>
            <DialogContent>
                <div className={stl.addTeamForm}>
                    {!isSingles && (
                        <TextField
                            margin="dense"
                            label="Team Name (Optional)"
                            helperText="If not provided, will be auto-generated as 'Team {ID}'"
                            fullWidth
                            value={team.team_name}
                            onChange={(e) => setTeam(prev => ({ ...prev, team_name: e.target.value }))}
                        />
                    )}
                    
                    <div className={stl.playersContainer}>
                        <div className={stl.playerInputs}>
                            <h4>{isSingles ? 'Select Player' : 'Select Player 1'}</h4>
                            <FormControl fullWidth margin="dense">
                                <Autocomplete
                                    value={team.player1}
                                    onChange={(_, newValue) => {
                                        setTeam(prev => ({
                                            ...prev,
                                            player1: newValue
                                        }));
                                    }}
                                    options={players}
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
                                            setTeam(prev => ({
                                                ...prev,
                                                player2: newValue
                                            }));
                                        }}
                                        options={getPlayer2Options()}
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
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    disabled={!isValid}
                >
                    Add {isSingles ? 'Player' : 'Team'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddTeamDialog; 