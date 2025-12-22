import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import stl from './EditTeamDialog.module.scss';

const SKILL_LEVELS = {
    BEGINNER: 'BEGINNER',
    INTERMEDIATE: 'INTERMEDIATE',
    ADVANCED: 'ADVANCED'
};

const EditTeamDialog = ({ open, onClose, onSave, team, isSingles }) => {
    const [editedTeam, setEditedTeam] = useState({
        team_name: '',
        player1: {
            name: '',
            phone_number: '',
            skill_type: ''
        },
        player2: {
            name: '',
            phone_number: '',
            skill_type: ''
        }
    });

    useEffect(() => {
        if (team) {
            setEditedTeam({
                team_name: team.team_name || '',
                player1: {
                    name: team.player1.name || '',
                    phone_number: team.player1.phone_number || '',
                    skill_type: team.player1.skill_type || ''
                },
                player2: {
                    name: team.player2?.name || '',
                    phone_number: team.player2?.phone_number || '',
                    skill_type: team.player2?.skill_type || ''
                }
            });
        }
    }, [team]);

    const handlePlayerChange = (playerNum, field, value) => {
        setEditedTeam(prev => ({
            ...prev,
            [playerNum]: {
                ...prev[playerNum],
                [field]: value
            }
        }));
    };

    const handleSubmit = () => {
        onSave(editedTeam);
    };

    if (!team) return null;

    const isValid = isSingles
        ? editedTeam.player1.name.trim()
        : editedTeam.player1.name.trim() && editedTeam.player2.name.trim();

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Edit {isSingles ? 'Player' : 'Team'}</DialogTitle>
            <DialogContent>
                <div className={stl.editTeamForm}>
                    {!isSingles && (
                        <TextField
                            margin="dense"
                            label="Team Name"
                            fullWidth
                            value={editedTeam.team_name}
                            onChange={(e) => setEditedTeam(prev => ({ ...prev, team_name: e.target.value }))}
                        />
                    )}
                    
                    {['player1', ...(isSingles ? [] : ['player2'])].map((player, idx) => (
                        <div key={idx} className={stl.playerInputs}>
                            <h4>{isSingles ? 'Player Details' : `Player ${idx + 1}`}</h4>
                            <TextField
                                required
                                margin="dense"
                                label="Name"
                                fullWidth
                                value={editedTeam[player].name}
                                onChange={(e) => handlePlayerChange(player, 'name', e.target.value)}
                            />
                            <TextField
                                margin="dense"
                                label="Phone Number"
                                fullWidth
                                value={editedTeam[player].phone_number}
                                onChange={(e) => handlePlayerChange(player, 'phone_number', e.target.value)}
                            />
                            <FormControl fullWidth margin="dense">
                                <InputLabel>Skill Level</InputLabel>
                                <Select
                                    value={editedTeam[player].skill_type}
                                    label="Skill Level"
                                    onChange={(e) => handlePlayerChange(player, 'skill_type', e.target.value)}
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    {Object.entries(SKILL_LEVELS).map(([key, value]) => (
                                        <MenuItem key={key} value={value}>
                                            {key.charAt(0) + key.slice(1).toLowerCase()}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    ))}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    disabled={!isValid}
                >
                    Save Changes
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditTeamDialog; 