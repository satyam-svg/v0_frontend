'use client'
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiCall } from "@/store/utils";
import { endpoints } from "@/store/urls";
import toast from "react-hot-toast";
import stl from "./PlayerCheckin.module.scss";

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
  </svg>
);

const PlayerCheckin = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tournamentId, setTournamentId] = useState(null);

  useEffect(() => {
    const tid = searchParams.get('tid');
    if (!tid) {
      router.push('/');
      return;
    }
    setTournamentId(tid);
  }, [searchParams, router]);

  const [lookupType, setLookupType] = useState('phone');
  const [lookupValue, setLookupValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [playerDetails, setPlayerDetails] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState(null);

  const fetchPlayerDetails = async () => {
    if (!lookupValue) {
      toast.error(`Please enter a ${lookupType === 'phone' ? 'phone number' : 'Khel Club ID'}`);
      return;
    }

    if (!tournamentId) {
      toast.error('Invalid tournament ID');
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (lookupType === 'phone') {
        params.append('phone', lookupValue);
      } else {
        params.append('uuid', lookupValue);
      }
      params.append('super_tournament_id', tournamentId);

      const response = await apiCall(`${endpoints.playerLookup}?${params.toString()}`);

      if (response && response.player) {
        setPlayerDetails(response.player);
        setEditedDetails(response.player);
        toast.success('Player details found');
      } else {
        toast.error('No player found with the provided details');
        setPlayerDetails(null);
        setEditedDetails(null);
      }
    } catch (error) {
      console.error('Error fetching player details:', error);
      toast.error(error.message || 'Failed to fetch player details. Please try again.');
      setPlayerDetails(null);
      setEditedDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!editedDetails?.uuid) {
      toast.error('Player UUID is required');
      return;
    }

    setIsLoading(true);
    try {
      // Start with the required uuid
      const requestBody = {
        uuid: editedDetails.uuid
      };

      // Only include fields that have been modified
      if (editedDetails.first_name !== playerDetails.first_name) {
        requestBody.first_name = editedDetails.first_name;
      }
      if (editedDetails.last_name !== playerDetails.last_name) {
        requestBody.last_name = editedDetails.last_name;
      }
      if (editedDetails.gender !== playerDetails.gender) {
        requestBody.gender = editedDetails.gender;
      }
      if (editedDetails.age !== playerDetails.age) {
        requestBody.age = editedDetails.age;
      }
      if (editedDetails.phone_number !== playerDetails.phone_number) {
        requestBody.phone_number = editedDetails.phone_number;
      }
      if (editedDetails.email !== playerDetails.email) {
        requestBody.email = editedDetails.email;
      }
      if (editedDetails.skill_type !== playerDetails.skill_type) {
        requestBody.skill_type = editedDetails.skill_type;
      }
      if (editedDetails.dupr_id !== playerDetails.dupr_id) {
        requestBody.dupr_id = editedDetails.dupr_id;
      }

      console.log('Sending update request with body:', requestBody); // Debug log

      const response = await apiCall(endpoints.updatePlayerDetails, {
        method: 'PUT',
        body: requestBody
      });

      if (response && response.player) {
        setPlayerDetails(response.player);
        setEditedDetails(response.player);
        setIsEditing(false);
        toast.success('Player details updated successfully');
      } else {
        throw new Error(response?.error || 'Failed to update player details');
      }
    } catch (error) {
      console.error('Error updating player details:', error);
      toast.error(error.message || 'Failed to update player details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckin = async () => {
    if (!playerDetails) {
      toast.error('Please fetch player details first');
      return;
    }

    if (!tournamentId) {
      toast.error('Invalid tournament ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiCall(endpoints.playerSuperTournamentCheckin, {
        method: 'POST',
        body: {
          player_id: playerDetails.id,
          super_tournament_id: parseInt(tournamentId),
          checked_in: true
        }
      });

      if (response && response.message) {
        toast.success(response.message);
        // Update player details with the response data
        if (response.player) {
          setPlayerDetails(prev => ({
            ...prev,
            ...response.player,
            checked_in: response.player.checked_in
          }));
        }
      } else {
        throw new Error(response?.error || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      // Handle specific error cases
      switch (error.message) {
        case 'player_id and super_tournament_id are required':
          toast.error('Player ID and tournament ID are required');
          break;
        case 'Player not found':
          toast.error('Player not found');
          break;
        case 'Player does not belong to the specified super tournament':
          toast.error('Player is not registered in this tournament');
          break;
        case 'Super tournament not found':
          toast.error('Tournament not found');
          break;
        case 'No tournaments found in this super tournament':
          toast.error('No active tournaments found');
          break;
        default:
          toast.error(error.message || 'Failed to check in');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!tournamentId) {
    return <div className={stl.error}>Loading...</div>;
  }

  return (
    <div className={stl.container}>
      <div className={stl.checkinCard}>
        <h2 className={stl.cardTitle}>Player Check-in</h2>
        <h3 className={stl.cardSubtitle}>Tournament ID: {tournamentId}</h3>

        {playerDetails && playerDetails.checked_in && (
          <div className={stl.checkinBanner}>
            <CheckIcon />
            Player is already checked in
          </div>
        )}
        
        <div className={stl.lookupSection}>
          <div className={stl.lookupType}>
            <label className={stl.radioLabel}>
              <input
                type="radio"
                value="phone"
                checked={lookupType === 'phone'}
                onChange={(e) => {
                  setLookupType(e.target.value);
                  setLookupValue('');
                  setPlayerDetails(null);
                  setEditedDetails(null);
                }}
                className={stl.radioInput}
              />
              Phone Number
            </label>
            <label className={stl.radioLabel}>
              <input
                type="radio"
                value="uuid"
                checked={lookupType === 'uuid'}
                onChange={(e) => {
                  setLookupType(e.target.value);
                  setLookupValue('');
                  setPlayerDetails(null);
                  setEditedDetails(null);
                }}
                className={stl.radioInput}
              />
              Khel Club ID
            </label>
          </div>
        
        <div className={stl.inputSection}>
          <input
              type={lookupType === 'phone' ? 'tel' : 'text'}
              placeholder={lookupType === 'phone' ? 'Enter phone number' : 'Enter Khel Club ID'}
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              className={stl.lookupInput}
              disabled={isLoading}
          />
          <button
              onClick={fetchPlayerDetails}
              disabled={isLoading}
            className={stl.fetchButton}
          >
              {isLoading ? 'Fetching...' : 'Fetch Details'}
          </button>
          </div>
        </div>

        {playerDetails && (
            <div className={stl.playerDetails}>
            <div className={stl.detailsHeader}>
              <h4 className={stl.detailsTitle}>Player Details</h4>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className={stl.editButton}
                  disabled={isLoading}
                >
                  Edit Details
                </button>
              ) : (
                <div className={stl.editActions}>
                  <button
                    onClick={handleSaveDetails}
                    className={stl.saveButton}
                    disabled={isLoading}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedDetails(playerDetails);
                    }}
                    className={stl.cancelButton}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

              <div className={stl.detailsGrid}>
              {isEditing ? (
                // Edit form
                <>
                  <div className={stl.detailItem}>
                    <label className={stl.detailLabel}>First Name:</label>
                    <input
                      type="text"
                      value={editedDetails.first_name}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        first_name: e.target.value
                      })}
                      className={stl.detailInput}
                    />
                  </div>
                  <div className={stl.detailItem}>
                    <label className={stl.detailLabel}>Last Name:</label>
                    <input
                      type="text"
                      value={editedDetails.last_name || ''}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        last_name: e.target.value
                      })}
                      className={stl.detailInput}
                    />
                  </div>
                  <div className={stl.detailItem}>
                    <label className={stl.detailLabel}>Gender:</label>
                    <select
                      value={editedDetails.gender || ''}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        gender: e.target.value
                      })}
                      className={stl.detailInput}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className={stl.detailItem}>
                    <label className={stl.detailLabel}>Phone:</label>
                    <input
                      type="tel"
                      value={editedDetails.phone_number}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        phone_number: e.target.value
                      })}
                      className={stl.detailInput}
                    />
                  </div>
                  <div className={stl.detailItem}>
                    <label className={stl.detailLabel}>Email:</label>
                    <input
                      type="email"
                      value={editedDetails.email}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        email: e.target.value
                      })}
                      className={stl.detailInput}
                    />
                  </div>
                  <div className={stl.detailItem}>
                    <label className={stl.detailLabel}>DUPR ID:</label>
                    <input
                      type="text"
                      value={editedDetails.dupr_id || ''}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        dupr_id: e.target.value
                      })}
                      className={stl.detailInput}
                    />
                  </div>
                  <div className={stl.detailItem}>
                    <label className={stl.detailLabel}>Skill Type:</label>
                    <select
                      value={editedDetails.skill_type}
                      onChange={(e) => setEditedDetails({
                        ...editedDetails,
                        skill_type: e.target.value
                      })}
                      className={stl.detailInput}
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                </>
              ) : (
                // Display details
                <>
                <div className={stl.detailItem}>
                    <span className={stl.detailLabel}>Name:</span>
                    <span>{`${playerDetails.first_name} ${playerDetails.last_name || ''}`}</span>
                </div>
                <div className={stl.detailItem}>
                    <span className={stl.detailLabel}>Gender:</span>
                    <span>{playerDetails.gender || 'Not Specified'}</span>
                </div>
                <div className={stl.detailItem}>
                    <span className={stl.detailLabel}>Phone:</span>
                    <span>{playerDetails.phone_number}</span>
                </div>
                <div className={stl.detailItem}>
                    <span className={stl.detailLabel}>Email:</span>
                  <span>{playerDetails.email}</span>
                </div>
                <div className={stl.detailItem}>
                    <span className={stl.detailLabel}>DUPR ID:</span>
                    <span>{playerDetails.dupr_id || 'Not provided'}</span>
                  </div>
                  <div className={stl.detailItem}>
                    <span className={stl.detailLabel}>Skill Type:</span>
                    <span>{playerDetails.skill_type}</span>
                </div>
                <div className={stl.detailItem}>
                    <span className={stl.detailLabel}>Khel Club ID:</span>
                    <span>{playerDetails.uuid}</span>
                </div>
                  <div className={stl.detailItem}>
                    <span className={stl.detailLabel}>Check-in Status:</span>
                    <span className={playerDetails.checked_in ? stl.checkedIn : stl.notCheckedIn}>
                      {playerDetails.checked_in ? 'Checked In' : 'Not Checked In'}
                    </span>
              </div>
                </>
              )}
            </div>
          </div>
        )}

        {playerDetails && !isEditing && !playerDetails.checked_in && (
            <button
              onClick={handleCheckin}
            disabled={isLoading}
            className={stl.checkinButton}
            >
            {isLoading ? 'Checking in...' : 'Check-in Player'}
            </button>
        )}

        <button
          onClick={() => router.push(`/tournament?id=${tournamentId}`)}
          className={stl.backButton}
          disabled={isLoading}
        >
          Back to Tournament
        </button>
      </div>
    </div>
  );
};

export default PlayerCheckin; 