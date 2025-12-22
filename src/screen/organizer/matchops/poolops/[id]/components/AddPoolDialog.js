import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from '@mui/material';

const AddPoolDialog = ({ open, onClose, onAdd }) => {
    const [poolName, setPoolName] = useState('');

    const handleSubmit = () => {
        onAdd(poolName);
        setPoolName('');
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Add New Pool</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Pool Name"
                    type="text"
                    fullWidth
                    value={poolName}
                    onChange={(e) => setPoolName(e.target.value)}
                    helperText="Pool name cannot contain spaces"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit} variant="contained">Create</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddPoolDialog; 