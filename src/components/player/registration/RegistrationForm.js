'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Box, TextField, Button, FormControl, InputLabel, 
  Select, MenuItem, Typography, Container, Grid, 
  Paper, Dialog, DialogTitle, DialogContent, 
  DialogActions, Alert, CircularProgress 
} from '@mui/material';
import { playerService } from '@/services/playerService';
import { apiCall } from '@/store/utils';
import { endpoints } from '@/store/urls';

const PlayerForm = ({ player, data, onPlayerChange }) => (
  <Grid container spacing={3}>
    <Grid item xs={12} sm={6}>
      <TextField
        required
        fullWidth
        name="firstName"
        label="First Name"
        value={data.firstName}
        onChange={(e) => onPlayerChange(player, 'firstName', e.target.value)}
      />
    </Grid>
    
    <Grid item xs={12} sm={6}>
      <TextField
        required
        fullWidth
        name="lastName"
        label="Last Name"
        value={data.lastName}
        onChange={(e) => onPlayerChange(player, 'lastName', e.target.value)}
      />
    </Grid>

    <Grid item xs={12} sm={6}>
      <FormControl fullWidth required>
        <InputLabel>Gender</InputLabel>
        <Select
          name="gender"
          value={data.gender}
          label="Gender"
          onChange={(e) => onPlayerChange(player, 'gender', e.target.value)}
        >
          <MenuItem value="male">Male</MenuItem>
          <MenuItem value="female">Female</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12} sm={6}>
      <TextField
        required
        fullWidth
        name="age"
        label="Age"
        type="number"
        value={data.age}
        onChange={(e) => onPlayerChange(player, 'age', e.target.value)}
        inputProps={{ min: 0, max: 120 }}
      />
    </Grid>

    <Grid item xs={12} sm={6}>
      <TextField
        required
        fullWidth
        name="mobileNumber"
        label="Mobile Number"
        value={data.mobileNumber}
        onChange={(e) => onPlayerChange(player, 'mobileNumber', e.target.value)}
      />
    </Grid>

    <Grid item xs={12} sm={6}>
      <TextField
        required
        fullWidth
        name="email"
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => onPlayerChange(player, 'email', e.target.value)}
      />
    </Grid>

    <Grid item xs={12} sm={6}>
      <FormControl fullWidth required>
        <InputLabel>Skill Type</InputLabel>
        <Select
          name="skillType"
          value={data.skillType}
          label="Skill Type"
          onChange={(e) => onPlayerChange(player, 'skillType', e.target.value)}
        >
          <MenuItem value="beginner">Beginner</MenuItem>
          <MenuItem value="intermediate">Intermediate</MenuItem>
          <MenuItem value="advanced">Advanced</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        name="duprId"
        label="DUPR ID"
        value={data.duprId}
        onChange={(e) => onPlayerChange(player, 'duprId', e.target.value)}
      />
    </Grid>
  </Grid>
);

export default function RegistrationForm() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournament');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tournament, setTournament] = useState(null);

  const [tournamentType, setTournamentType] = useState('singles');
  const [formData, setFormData] = useState({
    player1: {
      firstName: '',
      lastName: '',
      gender: '',
      age: '',
      mobileNumber: '',
      email: '',
      skillType: '',
      duprId: ''
    },
    player2: {
      firstName: '',
      lastName: '',
      gender: '',
      age: '',
      mobileNumber: '',
      email: '',
      skillType: '',
      duprId: ''
    },
    seasonId: '',
    categoryId: ''
  });

  const fetchTournamentDetails = async (id) => {
    try {
      setLoading(true);
      const response = await apiCall(`${endpoints.getSuperTournamentDetails}/${id}`);
      setTournament(response || null);
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      setError('Failed to fetch tournament details');
      setTournament(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentDetails(tournamentId);
    }
  }, [tournamentId]);

  const handlePlayerChange = (player, field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [player]: {
        ...prevState[player],
        [field]: value
      }
    }));
  };

  const handleSeasonChange = (event) => {
    setFormData(prevState => ({
      ...prevState,
      seasonId: event.target.value,
      categoryId: '' // Reset category when season changes
    }));
  };

  const handleCategoryChange = (event) => {
    setFormData(prevState => ({
      ...prevState,
      categoryId: event.target.value
    }));
  };

  const handlePayment = () => {
    window.open('https://pages.razorpay.com/pl_PUg1y392PupuKx/view', '_blank');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        tournament_id: parseInt(tournamentId),
        match_type: tournamentType,
        first_name: formData.player1.firstName,
        last_name: formData.player1.lastName,
        gender: formData.player1.gender,
        age: parseInt(formData.player1.age),
        mobile_number: formData.player1.mobileNumber,
        email: formData.player1.email,
        skill_type: formData.player1.skillType,
        dupr_id: formData.player1.duprId || undefined,
        season_id: formData.seasonId,
        category_id: formData.categoryId
      };

      if (tournamentType === 'doubles') {
        payload.player2 = {
          first_name: formData.player2.firstName,
          last_name: formData.player2.lastName,
          gender: formData.player2.gender,
          age: parseInt(formData.player2.age),
          mobile_number: formData.player2.mobileNumber,
          email: formData.player2.email,
          skill_type: formData.player2.skillType,
          dupr_id: formData.player2.duprId || undefined
        };
      }

      const response = await playerService.registerPlayer(payload);
      setRegistrationResult(response);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Registration failed:', error);
      setError(error?.message || 'Registration failed. Please try again.');
    }
  };

  const SuccessModal = () => (
    <Dialog
      open={showSuccessModal}
      onClose={() => {
        setShowSuccessModal(false);
        window.location.reload();
      }}
    >
      <DialogTitle>Registration Successful</DialogTitle>
      <DialogContent>
        <Typography>{registrationResult?.message}</Typography>
        <Typography sx={{ mt: 2 }}>
          Team ID: {registrationResult?.team_id}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setShowSuccessModal(false);
          window.location.reload();
        }}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const ErrorModal = () => (
    <Dialog
      open={!!error}
      onClose={() => {
        setError(null);
        window.location.reload();
      }}
    >
      <DialogTitle>Registration Failed</DialogTitle>
      <DialogContent>
        <Alert severity="error">
          {error}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => {
          setError(null);
          window.location.reload();
        }}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : tournament ? (
          <>
            <Typography variant="h5" gutterBottom>
              Tournament Registration: {tournament.name}
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Season</InputLabel>
                  <Select
                    value={formData.seasonId}
                    label="Season"
                    onChange={handleSeasonChange}
                  >
                    {tournament.seasons?.map((season) => (
                      <MenuItem key={season.id} value={season.id}>
                        {season.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required disabled={!formData.seasonId}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.categoryId}
                    label="Category"
                    onChange={handleCategoryChange}
                  >
                    {tournament.seasons?.find(s => s.id === formData.seasonId)?.tournaments?.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Tournament Type</InputLabel>
              <Select
                value={tournamentType}
                label="Tournament Type"
                onChange={(e) => setTournamentType(e.target.value)}
              >
                <MenuItem value="singles">Singles</MenuItem>
                <MenuItem value="doubles">Doubles</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>
              Player 1 Details
            </Typography>
            <PlayerForm player="player1" data={formData.player1} onPlayerChange={handlePlayerChange} />

            {tournamentType === 'doubles' && (
              <>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Player 2 Details
                </Typography>
                <PlayerForm player="player2" data={formData.player2} onPlayerChange={handlePlayerChange} />
              </>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                Register
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handlePayment}
                disabled={loading}
              >
                Make Payment
              </Button>
            </Box>
          </>
        ) : (
          <Alert severity="info">Please provide a valid tournament ID to proceed with registration.</Alert>
        )}
      </Paper>

      <SuccessModal />
      <ErrorModal />
    </Container>
  );
} 