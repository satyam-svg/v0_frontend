import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from '@mui/material';
import stl from './PlayerInfoDialog.module.scss';

const PlayerInfoDialog = ({ player, onClose }) => {
    if (!player) return null;

    return (
        <Dialog open={!!player} onClose={onClose}>
            <DialogTitle>Player Details</DialogTitle>
            <DialogContent>
                <div className={stl.playerDetails}>
                    <div className={stl.detail}>
                        <span className={stl.label}>Name:</span>
                        <span className={stl.value}>{player.name}</span>
                    </div>
                    <div className={stl.detail}>
                        <span className={stl.label}>Phone:</span>
                        <span className={stl.value}>{player.phone_number}</span>
                    </div>
                    <div className={stl.detail}>
                        <span className={stl.label}>Email:</span>
                        <span className={stl.value}>{player.email || 'N/A'}</span>
                    </div>
                    <div className={stl.detail}>
                        <span className={stl.label}>Gender:</span>
                        <span className={stl.value}>{player.gender || 'N/A'}</span>
                    </div>
                    <div className={stl.detail}>
                        <span className={stl.label}>Age:</span>
                        <span className={stl.value}>{player.age || 'N/A'}</span>
                    </div>
                    <div className={stl.detail}>
                        <span className={stl.label}>Skill:</span>
                        <span className={stl.value}>{player.skill_type || 'N/A'}</span>
                    </div>
                    <div className={stl.detail}>
                        <span className={stl.label}>DUPR ID:</span>
                        <span className={stl.value}>{player.dupr_id || 'N/A'}</span>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default PlayerInfoDialog; 