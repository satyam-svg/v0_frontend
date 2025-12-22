'use client'
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/store/utils";
import { endpoints } from "@/store/urls";
import toast from "react-hot-toast";
import stl from "./DexterCheckin.module.scss";

const DexterCheckin = ({ tournamentId }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [playerDetails, setPlayerDetails] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [allPlayers, setAllPlayers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [editedSkillType, setEditedSkillType] = useState('');
  const [initialPhoneNumber, setInitialPhoneNumber] = useState('');
  const [initialEmail, setInitialEmail] = useState('');
  const [initialSkillType, setInitialSkillType] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [initialFirstName, setInitialFirstName] = useState('');
  const [initialLastName, setInitialLastName] = useState('');

  useEffect(() => {
    if (!tournamentId) {
      router.push('/');
      return;
    }
    fetchPlayers(tournamentId);
  }, [tournamentId, router]);

  const fetchPlayers = async (tid) => {
    try {
      const response = await apiCall(`${endpoints.getPlayers}?super_tournament_id=${tid}`);
      if (response) {
        setAllPlayers(response);
      }
    } catch (error) {
      console.error('Error fetching players:', error);
      toast.error('Failed to load players list');
    }
  };

  useEffect(() => {
    if (playerDetails) {
      const phone = playerDetails.phone_number || '';
      const cleanPhone = phone.includes('_') || phone.length < 8 ? '' : phone;
      const validPhone = cleanPhone.length === 10 ? cleanPhone : '';
      setPhoneNumber(validPhone);
      setInitialPhoneNumber(validPhone);
      
      const playerEmail = playerDetails.email || '';
      const validEmail = playerEmail.includes('@example.com') ? '' : playerEmail;
      setEmail(validEmail);
      setInitialEmail(validEmail);
      
      const skill = playerDetails.skill_type || 'BEGINNER';
      setEditedSkillType(skill);
      setInitialSkillType(skill);

      // Set name fields
      setEditedFirstName(playerDetails.first_name || '');
      setEditedLastName(playerDetails.last_name || '');
      setInitialFirstName(playerDetails.first_name || '');
      setInitialLastName(playerDetails.last_name || '');
    }
  }, [playerDetails]);

  const filteredPlayers = useMemo(() => {
    if (!searchText) return [];
    const searchLower = searchText.toLowerCase();
    return allPlayers.filter(player => {
      const fullName = `${player.first_name} ${player.last_name}`.toLowerCase();
      return fullName.includes(searchLower);
    }).slice(0, 5); // Limit to 5 suggestions
  }, [searchText, allPlayers]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setShowSuggestions(true);
  };

  const handleSelectPlayer = (player) => {
    setSearchText(`${player.first_name} ${player.last_name}`);
    setPlayerDetails(player);
    setShowSuggestions(false);
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    // Don't allow @example.com emails
    if (value.includes('@example.com')) {
      setEmail('');
    } else {
      setEmail(value);
    }
  };

  const handleSkillTypeChange = (e) => {
    setEditedSkillType(e.target.value);
  };

  const handleFirstNameChange = (e) => {
    setEditedFirstName(e.target.value);
  };

  const handleLastNameChange = (e) => {
    setEditedLastName(e.target.value);
  };

  const handleCheckin = async () => {
    if (!playerDetails) {
      toast.error('Please select a player first');
      return;
    }

    if (phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      // First update player details
      const updateResponse = await apiCall(endpoints.updatePlayer2, {
        method: 'PUT',
        body: {
          uuid: playerDetails.uuid,
          first_name: editedFirstName,
          last_name: editedLastName,
          skill_type: editedSkillType,
          phone_number: phoneNumber,
          email: email
        }
      });

      if (!updateResponse) {
        throw new Error('Failed to update player details');
      }

      // Then proceed with check-in
      const response = await apiCall(endpoints.playerSuperTournamentCheckin, {
        method: 'POST',
        body: {
          player_id: playerDetails.id,
          uuid: playerDetails.uuid,
          super_tournament_id: parseInt(tournamentId),
          checked_in: true
        }
      });

      if (response && response.message) {
        setShowSuccessPopup(true);
        // Refresh players list
        fetchPlayers(tournamentId);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      toast.error(error.message || 'Failed to check in player');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!playerDetails) {
      return;
    }

    if (phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const updateResponse = await apiCall(endpoints.updatePlayer2, {
        method: 'PUT',
        body: {
          uuid: playerDetails.uuid,
          first_name: editedFirstName,
          last_name: editedLastName,
          skill_type: editedSkillType,
          phone_number: phoneNumber,
          email: email
        }
      });

      if (updateResponse) {
        toast.success('Player details updated successfully');
        setInitialPhoneNumber(phoneNumber);
        setInitialEmail(email);
        setInitialSkillType(editedSkillType);
        setInitialFirstName(editedFirstName);
        setInitialLastName(editedLastName);
        // Update search text to reflect new name
        setSearchText(`${editedFirstName} ${editedLastName}`);
        // Refresh players list
        fetchPlayers(tournamentId);
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.message || 'Failed to update player details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
  };

  const handleLearnMore = async () => {
    setIsLoading(true);
    try {
      // Mark user as interested by setting age to 69
      const updateResponse = await apiCall(endpoints.updatePlayer2, {
        method: 'PUT',
        body: {
          uuid: playerDetails.uuid,
          age: 69
        }
      });

      if (updateResponse) {
        toast.success('Thank you for your interest!');
        window.open('https://khelclub.co', '_blank');
      }
    } catch (error) {
      console.error('Error marking interest:', error);
      toast.error('Failed to record your interest. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!tournamentId) {
    return <div className={stl.error}>Loading...</div>;
  }

  const isPhoneValid = phoneNumber.length === 10;
  const hasChanges = phoneNumber !== initialPhoneNumber || 
                    email !== initialEmail || 
                    editedSkillType !== initialSkillType ||
                    editedFirstName !== initialFirstName ||
                    editedLastName !== initialLastName;
  const isCheckedIn = playerDetails?.checked_in;

  return (
    <div className={stl.container}>
      {showSuccessPopup && (
        <div className={stl.popupOverlay}>
          <div className={stl.popup}>
            <div className={stl.popupContent}>
              <div className={stl.successIcon}>✓</div>
              <h2 className={stl.popupTitle}>Check-in Successful</h2>
              <p className={stl.raisingRound}>
                Khel Club is raising a pre-seed round.
              </p>
              <button 
                className={stl.learnMoreButton}
                onClick={handleLearnMore}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : "I want to know more"}
              </button>
              <button 
                className={stl.closeButton}
                onClick={handleClosePopup}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={stl.brandCard}>
        <div className={stl.logoSection}>
          <img src="/dexter-logo.svg" alt="Dexter Capital" className={stl.dexterLogo} />
          <img src="/logo.png" alt="KhelClub" className={stl.khelLogo} />
        </div>
        <h1 className={stl.brandTitle}>Dexter Capital Pickleball Tournament</h1>
        <p className={stl.poweredBy}>powered by KhelClub</p>
      </div>

      <div className={stl.checkinCard}>
        <div className={stl.searchSection}>
          <div className={stl.searchContainer}>
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder="Enter your name"
              className={stl.input}
              disabled={isLoading}
            />
            {showSuggestions && filteredPlayers.length > 0 && (
              <div className={stl.suggestions}>
                {filteredPlayers.map((player) => (
                  <div
                    key={player.uuid}
                    className={stl.suggestionItem}
                    onClick={() => handleSelectPlayer(player)}
                  >
                    <span className={stl.playerName}>
                      {player.first_name} {player.last_name}
                    </span>
                    {player.checked_in && (
                      <span className={stl.checkedInTag}>✓ Checked In</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {playerDetails && (
          <div className={stl.playerCard}>
            <div className={stl.playerHeader}>
              <div className={stl.welcomeSection}>
                <h3 className={stl.welcomeText}>
                  Welcome {playerDetails.first_name} {playerDetails.last_name}!
                </h3>
                <div className={stl.detailsSection}>
                  <div className={stl.nameSection}>
                    <div className={stl.nameInputGroup}>
                      <input
                        type="text"
                        value={editedFirstName}
                        onChange={handleFirstNameChange}
                        placeholder="First Name"
                        className={stl.nameField}
                        disabled={isLoading}
                      />
                      <input
                        type="text"
                        value={editedLastName}
                        onChange={handleLastNameChange}
                        placeholder="Last Name"
                        className={stl.nameField}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className={stl.phoneSection}>
                    <div className={stl.phoneInput}>
                      <span className={stl.phonePrefix}>+91</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="Enter phone number"
                        className={stl.phoneField}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className={stl.emailSection}>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter email address"
                      className={stl.emailField}
                      disabled={isLoading}
                    />
                  </div>
                  <div className={stl.skillLevelSection}>
                    <select
                      value={editedSkillType}
                      onChange={handleSkillTypeChange}
                      className={stl.skillSelect}
                      disabled={isLoading}
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>
                </div>
              </div>
              {playerDetails.checked_in && (
                <div className={stl.checkedInBadge}>
                  ✓ Checked In
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={isCheckedIn ? handleUpdate : handleCheckin}
          disabled={isLoading || !playerDetails || (!isCheckedIn && !isPhoneValid) || (isCheckedIn && (!hasChanges || !isPhoneValid))}
          className={stl.checkinButton}
        >
          {isLoading ? 'Processing...' : isCheckedIn ? 'Update Details' : 'Check-in'}
        </button>
      </div>
    </div>
  );
};

export default DexterCheckin; 