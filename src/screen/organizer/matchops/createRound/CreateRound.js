'use client'
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import stl from './CreateRound.module.scss';
import { endpoints } from '@/store/urls';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { apiCall } from '@/store/utils';

// Validation schema with Yup
const validationSchema = Yup.object({
    tournamentId: Yup.string().required('Tournament ID is required'),
    seasonId: Yup.string().required('Season is required'),
    categoryId: Yup.string().required('Category is required'),
    round_id: Yup.number()
        .required('Round ID is required')
        .min(1, 'Round ID must be a positive number'),
    number_of_pools: Yup.number()
        .required('Number of pools is required')
        .min(1, 'Must be at least 1 pool')
        .integer('Number of pools must be an integer'),
    round_name: Yup.string().required('Round Name is required'),
    teams: Yup.array()
        .of(Yup.string().required('Each team name is required'))
        .min(1, 'At least one team is required')
});

const CreateRoundScreen = () => {
    const router = useRouter();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    const formik = useFormik({
        initialValues: {
            tournamentId: '',
            seasonId: '',
            categoryId: '',
            round_id: '',
            round_name: '',
            number_of_pools: '',
            teams: [],
            teamsInput: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            const { teamsInput, tournamentId, seasonId, ...submitValues } = values;
            try {
                const response = await fetch(endpoints.createRound, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...submitValues,
                        tournament_id: values.categoryId
                    })
                });

                const resp = await response.json();

                if (response.ok) {
                    toast.success('Round created successfully');
                    router.push('/organizer/match-ops');
                } else {
                    throw new Error(resp.error || 'Failed to create round');
                }
            } catch (error) {
                toast.error(error.message);
                console.error('Error:', error);
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

    const handleBack = () => {
        router.push('/organizer/match-ops');
    };

    return (
        <div className={stl.createRoundScreen}>
            <h2>Create Round</h2>
            <form onSubmit={formik.handleSubmit} className={stl.form}>
                {/* Tournament Selection Section */}
                <div className={stl.formSection}>
                    <div>
                        <label htmlFor="tournamentId">Tournament ID</label>
                        <input
                            id="tournamentId"
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

                    <div>
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

                    <div>
                        <label htmlFor="categoryId">Category</label>
                        <select
                            id="categoryId"
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

                <div>
                    <label htmlFor="round_id">Round ID</label>
                    <input
                        id="round_id"
                        type="number"
                        name="round_id"
                        value={formik.values.round_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                    />
                    {formik.touched.round_id && formik.errors.round_id && (
                        <div className={stl.error}>{formik.errors.round_id}</div>
                    )}
                </div>

                <div>
                    <label htmlFor="round_name">Round Name</label>
                    <input
                        id="round_name"
                        type="text"
                        name="round_name"
                        value={formik.values.round_name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                    />
                    {formik.touched.round_name && formik.errors.round_name && (
                        <div className={stl.error}>{formik.errors.round_name}</div>
                    )}
                </div>

                <div>
                    <label htmlFor="number_of_pools">Number of Pools</label>
                    <input
                        id="number_of_pools"
                        type="number"
                        name="number_of_pools"
                        value={formik.values.number_of_pools}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                    />
                    {formik.touched.number_of_pools && formik.errors.number_of_pools && (
                        <div className={stl.error}>{formik.errors.number_of_pools}</div>
                    )}
                </div>

                <div>
                    <label htmlFor="teams">Teams (Comma-separated)</label>
                    <input
                        id="teams"
                        type="text"
                        name="teams"
                        placeholder="e.g., Test_T1, Test_T2, Test_T5"
                        value={formik.values.teamsInput || formik.values.teams.join(', ')}
                        onChange={(e) => {
                            formik.setFieldValue('teamsInput', e.target.value);
                        }}
                        onBlur={(e) => {
                            const inputValue = formik.values.teamsInput || '';
                            const teamsArray = inputValue
                                .split(',')
                                .map(team => team.trim())
                                .filter(team => team !== '');
                            formik.setFieldValue('teams', teamsArray);
                            formik.setFieldValue('teamsInput', '');
                            formik.handleBlur(e);
                        }}
                        required
                    />
                    {formik.touched.teams && formik.errors.teams && (
                        <div className={stl.error}>{formik.errors.teams}</div>
                    )}
                </div>

                <button type="submit" className={stl.submitButton}>Create Round</button>
                <button type="button" onClick={handleBack} className={stl.backButton}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default CreateRoundScreen;
