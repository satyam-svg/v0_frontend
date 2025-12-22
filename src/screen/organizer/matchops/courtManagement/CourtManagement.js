'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { endpoints } from '@/store/urls';
import { apiCall } from '@/store/utils';
import toast from 'react-hot-toast';
import stl from './CourtManagement.module.scss';
import { CourtManagementFixtures } from '@/components/fixtures';
import Modal from '@/components/Modal/Modal';
import CourtOrders from '@/components/courtOrders/CourtOrders';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
    tournamentId: Yup.string().required('Tournament ID is required'),
    seasonId: Yup.string().required('Season is required'),
    categoryId: Yup.string().required('Category is required'),
});

const CourtManagementScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [numberOfCourts, setNumberOfCourts] = useState(4);
    const [selectedPool, setSelectedPool] = useState('');
    const [tournament, setTournament] = useState(null);
    const [showCourtModal, setShowCourtModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [isEditingCourts, setIsEditingCourts] = useState(false);
    const [availableCourts, setAvailableCourts] = useState([]);
    const [courtInput, setCourtInput] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [tournamentDetails, setTournamentDetails] = useState(null);

    const formik = useFormik({
        initialValues: {
            tournamentId: '',
            seasonId: '',
            categoryId: ''
        },
        validationSchema,
        onSubmit: async (values) => {
        try {
            setLoading(true);
                const response = await apiCall(`${endpoints.getTournamentDetails}/${values.categoryId}`);
            if (response) {
                setTournamentDetails(response);
                
                    const courtUrl = endpoints.getTournamentCourts.replace('{tournament_id}', values.categoryId);
                    const courtResponse = await apiCall(courtUrl);
                
                if (courtResponse) {
                    setNumberOfCourts(courtResponse.num_courts || 4);
                    setAvailableCourts(Array.from({ length: courtResponse.num_courts }, (_, i) => i + 1));
                }
            }
        } catch (error) {
            console.error('Error fetching tournament details:', error);
            toast.error(error.response?.error || 'Failed to fetch tournament details');
        } finally {
            setLoading(false);
        }
        }
    });

    const fetchTournamentDetails = async (id) => {
        try {
            setLoading(true);
            const response = await apiCall(`${endpoints.getSuperTournamentDetails}/${id}`);
            setTournament(response || null);
            // Clear season and category selection when tournament changes
            formik.setFieldValue('seasonId', '');
            formik.setFieldValue('categoryId', '');
        } catch (error) {
            console.error('Error fetching tournament details:', error);
            toast.error('Failed to fetch tournament details');
            setTournament(null);
            formik.setFieldValue('seasonId', '');
            formik.setFieldValue('categoryId', '');
        } finally {
            setLoading(false);
        }
    };

    // Handle tournament ID input change with debounce
    const handleTournamentChange = (e) => {
        const id = e.target.value.trim();
        formik.handleChange(e);

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        if (id) {
            const newTimeout = setTimeout(() => {
                fetchTournamentDetails(id);
            }, 500);
            setTypingTimeout(newTimeout);
        } else {
            setTournament(null);
            formik.setFieldValue('seasonId', '');
            formik.setFieldValue('categoryId', '');
        }
    };

    // Get categories for selected season
    const getCategories = () => {
        const season = tournament?.seasons?.find(s => s.id.toString() === formik.values.seasonId);
        return season?.tournaments || [];
    };

    const handleMatchClick = (match) => {
        setSelectedMatch(match);
        setShowCourtModal(true);
    };

    const handleCourtAssignment = async () => {
        if (!selectedMatch || !courtInput) {
            toast.error('Please enter a court number');
            return;
        }

        const courtNumber = parseInt(courtInput);
        if (isNaN(courtNumber) || courtNumber < 1) {
            toast.error('Please enter a valid court number');
            return;
        }

        if (courtNumber > numberOfCourts) {
            toast.error(`Court number cannot be greater than ${numberOfCourts}`);
            return;
        }

        try {
            setLoading(true);
            const url = endpoints.assignCourt.replace('{tournament_id}', formik.values.categoryId);
            
            const payload = {
                match_id: selectedMatch.match_id,
                court_number: courtNumber,
                court_order: 1
            };

            const response = await apiCall(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: payload
            });

            if (response.message) {
                toast.success(response.message);
                setShowCourtModal(false);
                setSelectedMatch(null);
                setCourtInput('');
                setRefreshKey(prev => prev + 1);
                formik.submitForm();
            }
        } catch (error) {
            console.error('Error assigning court:', error);
            toast.error(error.response?.error || 'Failed to assign court');
        } finally {
            setLoading(false);
        }
    };

    const updateTournamentCourts = async (numCourts) => {
        try {
            setLoading(true);
            const url = endpoints.updateTournamentCourts.replace('{tournament_id}', formik.values.categoryId);
            
            const payload = {
                num_courts: parseInt(numCourts)
            };

            const response = await apiCall(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: payload
            });

            if (response.message) {
                toast.success(response.message);
                setNumberOfCourts(response.num_courts);
                setAvailableCourts(Array.from({ length: response.num_courts }, (_, i) => i + 1));
            }
        } catch (error) {
            console.error('Error updating courts:', error);
            toast.error(error.response?.error || 'Failed to update number of courts');
        } finally {
            setLoading(false);
            setIsEditingCourts(false);
        }
    };

    const handleReorderMatches = async (courtNumber, matchOrders) => {
        try {
            setLoading(true);
            const url = endpoints.reorderCourtMatches.replace('{tournament_id}', formik.values.categoryId);
            
            const response = await apiCall(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    court_number: parseInt(courtNumber),
                    match_orders: matchOrders.map((matchId, index) => ({
                        match_id: matchId,
                        new_order: index + 1
                    }))
                })
            });

            if (response.message) {
                toast.success(response.message);
                formik.submitForm();
            }
        } catch (error) {
            console.error('Error reordering matches:', error);
            toast.error(error.response?.error || 'Failed to reorder matches');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={stl.courtManagementContainer}>
            <h1>Court Management</h1>
            
            <form onSubmit={formik.handleSubmit} className={stl.form}>
                {loading && <div className={stl.loading}>Loading...</div>}
                
                {tournament && (
                    <div className={stl.tournamentName}>
                        {tournament.name}
                    </div>
                )}

                {/* Tournament Selection Section */}
                <div className={stl.formSection}>
                    <div className={stl.formGroup}>
                        <label htmlFor="tournamentId">Tournament ID</label>
                        <input
                            id="tournamentId"
                            name="tournamentId"
                            type="text"
                            placeholder="Enter Tournament ID"
                            onChange={handleTournamentChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.tournamentId}
                            className={stl.input}
                        />
                        {formik.touched.tournamentId && formik.errors.tournamentId && (
                            <div className={stl.error}>{formik.errors.tournamentId}</div>
                        )}
                    </div>

                    <div className={stl.formGroup}>
                        <label htmlFor="seasonId">Season</label>
                        <select
                            id="seasonId"
                            name="seasonId"
                            onChange={(e) => {
                                formik.handleChange(e);
                                formik.setFieldValue('categoryId', '');
                            }}
                            onBlur={formik.handleBlur}
                            value={formik.values.seasonId}
                            className={stl.input}
                            disabled={!tournament || loading}
                        >
                            <option value="">Select Season</option>
                            {tournament?.seasons?.map(season => (
                                <option key={season.id} value={season.id}>
                                    {season.name}
                                </option>
                            ))}
                        </select>
                        {formik.touched.seasonId && formik.errors.seasonId && (
                            <div className={stl.error}>{formik.errors.seasonId}</div>
                        )}
                    </div>

                    <div className={stl.formGroup}>
                        <label htmlFor="categoryId">Category</label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.categoryId}
                            className={stl.input}
                            disabled={!formik.values.seasonId}
                        >
                            <option value="">Select Category</option>
                            {getCategories().map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name.split('~')[0]}
                                </option>
                            ))}
                        </select>
                        {formik.touched.categoryId && formik.errors.categoryId && (
                            <div className={stl.error}>{formik.errors.categoryId}</div>
                        )}
                    </div>

                    <button type="submit" className={stl.loadButton} disabled={loading}>
                        Load Tournament
                    </button>
                </div>
            </form>

            {tournamentDetails && (
                <div className={stl.tournamentInfo}>
                    <h2>{tournamentDetails.name}</h2>
                    <div className={stl.courtConfig}>
                        <label>Number of Courts:</label>
                        <div className={stl.courtInputGroup}>
                            <input
                                type="number"
                                min="1"
                                value={numberOfCourts}
                                disabled={!isEditingCourts}
                                onChange={(e) => setNumberOfCourts(parseInt(e.target.value))}
                            />
                            <button 
                                onClick={() => {
                                    if (isEditingCourts) {
                                        updateTournamentCourts(numberOfCourts);
                                    }
                                    setIsEditingCourts(!isEditingCourts);
                                }}
                                className={stl.editButton}
                            >
                                {isEditingCourts ? 'Save' : 'Edit'}
                            </button>
                        </div>
                    </div>

                        <CourtManagementFixtures
                        tournamentId={formik.values.categoryId}
                            onMatchClick={handleMatchClick}
                        refreshKey={refreshKey}
                        />
                
                        <CourtOrders
                        tournamentId={formik.values.categoryId}
                            numberOfCourts={numberOfCourts}
                        onReorder={handleReorderMatches}
                        refreshKey={refreshKey}
                        />
                    </div>
                )}

            <Modal
                isOpen={showCourtModal}
                onClose={() => {
                    setShowCourtModal(false);
                    setSelectedMatch(null);
                    setCourtInput('');
                }}
            >
                    <div className={stl.courtModal}>
                        <h3>Assign Court</h3>
                    <p>
                        {selectedMatch?.team1_players || selectedMatch?.team1?.name || 'TBD'} vs {selectedMatch?.team2_players || selectedMatch?.team2?.name || 'TBD'}
                    </p>
                    <div className={stl.courtInput}>
                        <label>Court Number:</label>
                            <input
                                type="number"
                                min="1"
                                max={numberOfCourts}
                                value={courtInput}
                                onChange={(e) => setCourtInput(e.target.value)}
                            />
                        </div>
                    <div className={stl.modalButtons}>
                        <button onClick={handleCourtAssignment} disabled={loading}>
                            {loading ? 'Assigning...' : 'Assign'}
                            </button>
                            <button 
                                onClick={() => {
                                    setShowCourtModal(false);
                                    setSelectedMatch(null);
                                    setCourtInput('');
                                }}
                            className={stl.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
        </div>
    );
};

export default CourtManagementScreen; 