'use client'
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState, useEffect } from 'react';
import { apiCall } from '@/store/utils';
import { endpoints } from '@/store/urls';
import toast from 'react-hot-toast';
import Modal from '@/components/common/Modal';
import stl from './CreateKnockout.module.scss';

// Validation schema
const validationSchema = Yup.object({
    tournamentId: Yup.string().required('Tournament ID is required'),
    seasonId: Yup.string().required('Season is required'),
    categoryId: Yup.string().required('Category is required'),
});

const CreateKnockoutScreen = () => {
    const router = useRouter();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const [teamIds, setTeamIds] = useState('');
    const [showTeamsModal, setShowTeamsModal] = useState(false);
    const [teamsPerPool, setTeamsPerPool] = useState('');
    const [poolColors] = useState({
        'A': '#FF6B6B',
        'B': '#4ECDC4',
        'C': '#45B7D1',
        'D': '#96CEB4',
        'E': '#FFEEAD',
        'F': '#D4A5A5',
        'G': '#9FA8DA',
        'H': '#FFD93D'
    });

    const formik = useFormik({
        initialValues: {
            tournamentId: '',
            seasonId: '',
            categoryId: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const teamIdList = teamIds.split(',').map(id => id.trim());
                const response = await apiCall(endpoints.createKnockout, {
                    method: 'POST',
                    body: {
                        tournament_id: values.categoryId,
                        team_ids: teamIdList
                    }
                });

                if (response) {
                    toast.success('Knockout bracket created successfully');
                    router.push('/organizer/match-ops');
                }
            } catch (error) {
                toast.error(error.message || 'Failed to create knockout bracket');
                console.error('Error:', error);
            }
        }
    });

    // Handle tournament ID change with debounce
    const handleTournamentChange = (e) => {
        const { value } = e.target;
        formik.setFieldValue('tournamentId', value);
        formik.setFieldValue('seasonId', '');
        formik.setFieldValue('categoryId', '');
        setTournament(null);

        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        setTypingTimeout(setTimeout(async () => {
            if (value) {
                setLoading(true);
                try {
                    const response = await apiCall(`${endpoints.getSuperTournament}/${value}`);
                    setTournament(response);
                } catch (error) {
                    toast.error('Failed to fetch tournament details');
                    console.error('Error:', error);
                } finally {
                    setLoading(false);
                }
            }
        }, 500));
    };

    // Get categories for selected season
    const getCategories = () => {
        const season = tournament?.seasons?.find(s => s.id.toString() === formik.values.seasonId);
        return season?.tournaments || [];
    };

    // Handle auto-generate teams
    const handleAutoGenerate = async () => {
        setShowTeamsModal(true);
    };

    // Handle teams per pool submission
    const handleTeamsPerPoolSubmit = async () => {
        if (!teamsPerPool) {
            toast.error('Please enter number of teams per pool');
            return;
        }

        try {
            setLoading(true);
            const response = await apiCall(`${endpoints.getTopTeams}?tournament_id=${formik.values.categoryId}&round_id=1&teams_per_pool=${teamsPerPool}`);
            
            if (response && response.top_teams) {
                // Format team IDs with color coding based on pools
                const formattedTeamIds = Object.entries(response.top_teams)
                    .flatMap(([pool, teams]) => 
                        teams.map(team => ({
                            id: team.team_id,
                            pool: pool
                        }))
                    )
                    .map(team => team.id)
                    .join(', ');
                
                setTeamIds(formattedTeamIds);
                setShowTeamsModal(false);
                toast.success(`Generated ${response.total_teams} teams`);
            }
        } catch (error) {
            toast.error(error.message || 'Failed to generate teams');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        router.push('/organizer/match-ops');
    };

    return (
        <div className={stl.createKnockoutScreen}>
            <h2>Create Knockout Bracket</h2>
            <form onSubmit={formik.handleSubmit} className={stl.form}>
                {/* Tournament Selection Section */}
                <div className={stl.formSection}>
                    <div className={stl.formGroup}>
                        <label>Tournament ID</label>
                        <input
                            type="text"
                            name="tournamentId"
                            placeholder="Enter Tournament ID"
                            onChange={handleTournamentChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.tournamentId}
                            required
                        />
                        {formik.touched.tournamentId && formik.errors.tournamentId && (
                            <div className={stl.error}>{formik.errors.tournamentId}</div>
                        )}
                    </div>

                    {loading && <div className={stl.loading}>Loading...</div>}

                    {tournament && (
                        <div className={stl.tournamentInfo}>
                            <p><strong>Tournament Name:</strong> {tournament.name}</p>
                            <p><strong>Description:</strong> {tournament.description}</p>
                        </div>
                    )}

                    <div className={stl.formGroup}>
                        <label>Season</label>
                        <select
                            name="seasonId"
                            onChange={(e) => {
                                formik.handleChange(e);
                                formik.setFieldValue('categoryId', '');
                            }}
                            onBlur={formik.handleBlur}
                            value={formik.values.seasonId}
                            disabled={!tournament || loading}
                            required
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
                        <label>Category</label>
                        <select
                            name="categoryId"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.categoryId}
                            disabled={!formik.values.seasonId}
                            required
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
                </div>

                {/* Team IDs Section */}
                <div className={stl.formSection}>
                    <div className={stl.formGroup}>
                        <label>Team IDs to Promote</label>
                        <div className={stl.teamIdsInput}>
                            <textarea
                                value={teamIds}
                                onChange={(e) => setTeamIds(e.target.value)}
                                placeholder="Enter team IDs separated by commas"
                                rows={4}
                            />
                            <button
                                type="button"
                                onClick={handleAutoGenerate}
                                disabled={!formik.values.categoryId}
                                className={stl.autoGenerateButton}
                            >
                                Auto Generate
                            </button>
                        </div>
                    </div>
                </div>

                <div className={stl.buttonGroup}>
                    <button type="submit" disabled={!teamIds.trim()}>
                        Generate Knockout Bracket
                    </button>
                    <button type="button" onClick={handleBack} className={stl.backButton}>
                        Cancel
                    </button>
                </div>
            </form>

            {/* Teams Per Pool Modal */}
            <Modal
                isOpen={showTeamsModal}
                onClose={() => setShowTeamsModal(false)}
            >
                <div className={stl.teamsModal}>
                    <h3>Teams Per Pool</h3>
                    <div className={stl.modalContent}>
                        <input
                            type="number"
                            min="1"
                            value={teamsPerPool}
                            onChange={(e) => setTeamsPerPool(e.target.value)}
                            placeholder="Enter number of teams"
                        />
                        <button
                            onClick={handleTeamsPerPoolSubmit}
                            disabled={!teamsPerPool || loading}
                        >
                            {loading ? 'Generating...' : 'Done'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CreateKnockoutScreen; 