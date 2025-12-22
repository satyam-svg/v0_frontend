'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Typography, Grid, Paper } from '@mui/material';

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
          <MenuItem value="other">Other</MenuItem>
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
        name="mobile"
        label="Mobile Number"
        value={data.mobile}
        onChange={(e) => onPlayerChange(player, 'mobile', e.target.value)}
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

    <Grid item xs={12}>
      <FormControl fullWidth required>
        <InputLabel>Skill Type</InputLabel>
        <Select
          name="skillType"
          value={data.skillType}
          label="Skill Type"
          onChange={(e) => onPlayerChange(player, 'skillType', e.target.value)}
        >
          <MenuItem value="amateur">Amateur</MenuItem>
          <MenuItem value="intermediate">Intermediate</MenuItem>
          <MenuItem value="pro">Pro</MenuItem>
        </Select>
      </FormControl>
    </Grid>
  </Grid>
);

export default function RegistrationForm() {
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get('tournament');

  const [tournamentType, setTournamentType] = useState('singles');
  const [formData, setFormData] = useState({
    player1: {
      firstName: '',
      lastName: '',
      gender: '',
      age: '',
      mobile: '',
      email: '',
      skillType: '',
    },
    player2: {
      firstName: '',
      lastName: '',
      gender: '',
      age: '',
      mobile: '',
      email: '',
      skillType: '',
    }
  });

  useEffect(() => {
    if (!tournamentId) {
      console.error('Tournament ID is required');
    }
  }, [tournamentId]);

  const handleTournamentTypeChange = (event) => {
    setTournamentType(event.target.value);
  };

  const handlePlayerChange = (player, field, value) => {
    setFormData(prevState => ({
      ...prevState,
      [player]: {
        ...prevState[player],
        [field]: value
      }
    }));
  };

  const handlePayment = () => {
    // TODO: Integrate with payment gateway
    window.open('YOUR_PAYMENT_GATEWAY_URL', '_blank');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log({
      tournamentId,
      tournamentType,
      formData: tournamentType === 'singles' 
        ? { player1: formData.player1 }
        : formData
    });
  };

  if (!tournamentId) {
    return (
      <Typography color="error" align="center">
        Invalid Tournament ID. Please check the URL.
      </Typography>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Tournament Type</InputLabel>
            <Select
              value={tournamentType}
              label="Tournament Type"
              onChange={handleTournamentTypeChange}
            >
              <MenuItem value="singles">Singles</MenuItem>
              <MenuItem value="doubles">Doubles</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Player 1 Details
            </Typography>
            <PlayerForm 
              player="player1" 
              data={formData.player1} 
              onPlayerChange={handlePlayerChange}
            />
          </Paper>
        </Grid>

        {tournamentType === 'doubles' && (
          <Grid item xs={12}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Player 2 Details
              </Typography>
              <PlayerForm 
                player="player2" 
                data={formData.player2}
                onPlayerChange={handlePlayerChange}
              />
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handlePayment}
            sx={{ mb: 2 }}
          >
            Proceed to Payment
          </Button>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
          >
            Register
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
