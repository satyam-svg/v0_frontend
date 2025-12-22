'use client'
import { endpoints } from "@/store/urls";
import stl from "./Details.module.scss";
import * as React from "react";
import toast from "react-hot-toast";
import { apiCall } from "@/store/utils";

const Details = ({ tournament_id, checkin }) => {
    // Function to handle API call for team check-in
    const [loading, setLoading] = React.useState(false);
    const [recievedTid, setRecievedTid] = React.useState(tournament_id);
    const [data, setData] = React.useState();
    const [update, setUpdate] = React.useState(false)
    const [selectedPlayer, setSelectedPlayer] = React.useState(null);
    const [isPlayerModalOpen, setIsPlayerModalOpen] = React.useState(false);
    const [editedPlayer, setEditedPlayer] = React.useState(null);

    const getTournamentDetails = async () => {
        if (!recievedTid) return; // Don't make request if tournament_id is undefined
        
        try {
            const url = endpoints.getTournamentDetails + `/${recievedTid}`;
            const response = await apiCall(url);
            setData(response);
        } catch (error) {
            console.log("Failed to fetch details:", error.message);
            toast.error("Failed to fetch tournament details");
        }
    };

    const handlePlayerCheckIn = async (player, checked_in = true) => {
        setLoading(true);
        try {
            const response = await apiCall(endpoints.playerCheckin, {
                method: 'POST',
                body: {
                    player_id: parseInt(player.player_id),
                    tournament_id: parseInt(tournament_id),
                    checked_in: checked_in
                }
            });
            
            if (response && response.message) {
                toast.success(response.message);
                // Fetch fresh data after check-in
                await getTournamentDetails();
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error("Error updating player check-in status:", error);
            toast.error(error.message || "Error updating check-in status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const lookupPlayer = async (searchType, value) => {
        try {
            const params = new URLSearchParams();
            if (searchType === 'phone') {
                params.append('phone', value);
            } else if (searchType === 'uuid') {
                params.append('uuid', value);
            }
            if (tournament_id) {
                params.append('super_tournament_id', tournament_id);
            }

            const response = await apiCall(`${endpoints.playerLookup}?${params.toString()}`);
            return response.player;
        } catch (error) {
            console.error("Failed to lookup player:", error);
            toast.error(error.message || "Failed to lookup player");
            return null;
        }
    };

    const updatePlayerDetails = async (playerData) => {
        try {
            // Start with the required uuid
            const requestBody = {
                uuid: playerData.uuid
            };

            // Only include fields that have been modified
            if (playerData.first_name !== selectedPlayer.first_name) {
                requestBody.first_name = playerData.first_name;
            }
            if (playerData.last_name !== selectedPlayer.last_name) {
                requestBody.last_name = playerData.last_name;
            }
            if (playerData.gender !== selectedPlayer.gender) {
                requestBody.gender = playerData.gender;
            }
            if (playerData.age !== selectedPlayer.age) {
                requestBody.age = playerData.age;
            }
            if (playerData.phone_number !== selectedPlayer.phone_number) {
                requestBody.phone_number = playerData.phone_number;
            }
            if (playerData.email !== selectedPlayer.email) {
                requestBody.email = playerData.email;
            }
            if (playerData.skill_type !== selectedPlayer.skill_type) {
                requestBody.skill_type = playerData.skill_type;
            }
            if (playerData.dupr_id !== selectedPlayer.dupr_id) {
                requestBody.dupr_id = playerData.dupr_id;
            }

            console.log('Sending update request with body:', requestBody); // Debug log

            const response = await apiCall(endpoints.updatePlayerDetails, {
                method: 'PUT',
                body: requestBody
            });
            
            if (response && response.player) {
                toast.success("Player details updated successfully");
                return response.player;
            } else {
                throw new Error(response?.error || 'Failed to update player details');
            }
        } catch (error) {
            console.error("Failed to update player:", error);
            toast.error(error.message || "Failed to update player details");
            throw error;
        }
    };

    const handleEditPlayer = (player) => {
        setSelectedPlayer(player);
        setEditedPlayer({...player});
        setIsPlayerModalOpen(true);
    };

    const handlePlayerEditModal = (field, value) => {
        setEditedPlayer(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSavePlayer = async () => {
        if (!editedPlayer?.uuid) {
            toast.error('Player UUID is required');
            return;
        }

        try {
            const updatedPlayer = await updatePlayerDetails(editedPlayer);
            setIsPlayerModalOpen(false);
            setSelectedPlayer(null);
            setEditedPlayer(null);
            // Refresh the data
            getTournamentDetails();
        } catch (error) {
            console.error("Error saving player details:", error);
        }
    };

    const handleClosePlayerModal = () => {
        setIsPlayerModalOpen(false);
        setSelectedPlayer(null);
        setEditedPlayer(null);
    };

    // Update tournament ID when prop changes
    React.useEffect(() => {
        if (tournament_id) {
            setRecievedTid(tournament_id);
        }
    }, [tournament_id]);

    // Fetch tournament details when ID is available
    React.useEffect(() => {
        if (recievedTid) {
            getTournamentDetails();
        }
    }, [recievedTid]);

    return (
        <div className={stl.container}>
            <h1 className={stl.title}>Tournament ID: {data?.tournament_id}</h1>
            {loading ? "Updating... Please wait" :
                <table className={stl.teamsTable}>
                    <thead>
                        <tr className={stl.headerRow}>
                            <th>Team Name</th>
                            <th>Player Name</th>
                            <th>Phone Number</th>
                            <th>DUPR ID</th>
                            {checkin && <th>Check-In</th>}
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!data ?
                            <tr className={stl.teamRow}>
                                <td colSpan={6} style={{ textAlign: "center" }}>Loading..</td>
                            </tr> :
                            data?.teams?.map((team) => {
                                const allPlayersCheckedIn = team.players.every(player => player.checked_in);
                                
                                return (
                                    <React.Fragment key={team.team_id}>
                                        {team.players.map((player, playerIndex) => (
                                            <tr key={player.player_id} 
                                                className={stl.playerRow}
                                                style={{
                                                    backgroundColor: allPlayersCheckedIn ? "#4CAF50" : 
                                                           player.checked_in ? "#FFD700" : "",
                                                }}>
                                                {playerIndex === 0 && (
                                                    <td className={stl.teamName} 
                                                        rowSpan={team.players.length}
                                                        style={{
                                                            backgroundColor: allPlayersCheckedIn ? "#4CAF50" : "",
                                                        }}>
                                                        {team.name}
                                                    </td>
                                                )}
                                                <td>
                                                    {player.first_name || player.last_name ? 
                                                        `${player.first_name || ''} ${player.last_name || ''}`.trim() : 
                                                        'N/A'
                                                    }
                                                </td>
                                                <td>{player.phone_number || "N/A"}</td>
                                                <td>{player?.dupr_id || ""}</td>
                                                {checkin && (
                                                    <td>
                                                        <button
                                                            onClick={() => handlePlayerCheckIn(player, !player.checked_in)}
                                                            className={`${stl.checkInButton} ${player.checked_in ? stl.checkedIn : ''}`}
                                                            disabled={loading}
                                                        >
                                                            {player.checked_in ? "Checked In" : "Check-In"}
                                                        </button>
                                                    </td>
                                                )}
                                                <td>
                                                    <button
                                                        onClick={() => handleEditPlayer(player)}
                                                        className={stl.editButton}
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}
                    </tbody>
                </table>
            }
            {/* Individual Player Edit Modal */}
            {isPlayerModalOpen && editedPlayer && (
                <div className={stl.modalOverlay}>
                    <div className={stl.modal}>
                        <div className={stl.modalHeader}>
                            <h2>Edit Player Details</h2>
                        </div>
                        <div className={stl.playerDetails}>
                            {/* Name */}
                            <div className={stl.field}>
                                <strong>Name:</strong>
                                <div className={stl.inputGroup}>
                                    <input
                                        type="text"
                                        value={editedPlayer.first_name || ''}
                                        onChange={(e) => handlePlayerEditModal('first_name', e.target.value)}
                                        placeholder="First Name"
                                    />
                                    <input
                                        type="text"
                                        value={editedPlayer.last_name || ''}
                                        onChange={(e) => handlePlayerEditModal('last_name', e.target.value)}
                                        placeholder="Last Name"
                                    />
                                </div>
                            </div>
                            {/* Gender */}
                            <div className={stl.field}>
                                <strong>Gender:</strong>
                                <select
                                    value={editedPlayer.gender || ''}
                                    onChange={(e) => handlePlayerEditModal('gender', e.target.value)}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            {/* Mobile */}
                            <div className={stl.field}>
                                <strong>Mobile:</strong>
                                <input
                                    type="tel"
                                    value={editedPlayer.phone_number || ''}
                                    onChange={(e) => handlePlayerEditModal('phone_number', e.target.value)}
                                    placeholder="Enter Mobile Number"
                                    pattern="[0-9]{10}"
                                />
                            </div>
                            {/* Email */}
                            <div className={stl.field}>
                                <strong>Email:</strong>
                                <input
                                    type="email"
                                    value={editedPlayer.email || ''}
                                    onChange={(e) => handlePlayerEditModal('email', e.target.value)}
                                    placeholder="Enter Email"
                                />
                            </div>
                            {/* DUPR ID */}
                            <div className={stl.field}>
                                <strong>DUPR ID:</strong>
                                <input
                                    type="text"
                                    value={editedPlayer.dupr_id || ''}
                                    onChange={(e) => handlePlayerEditModal('dupr_id', e.target.value)}
                                    placeholder="Enter DUPR ID"
                                />
                            </div>
                            {/* Skill Type */}
                            <div className={stl.field}>
                                <strong>Skill Type:</strong>
                                <select
                                    value={editedPlayer.skill_type || ''}
                                    onChange={(e) => handlePlayerEditModal('skill_type', e.target.value)}
                                >
                                    <option value="">Select Skill Level</option>
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>
                        <div className={stl.modalButtons}>
                            <button 
                                onClick={handleSavePlayer}
                                className={stl.confirmButton}
                            >
                                Save Changes
                            </button>
                            <button onClick={handleClosePlayerModal} className={stl.cancelButton}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Details;
