'use client'
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import stl from './CreateMatch.module.scss';
import { endpoints } from '@/store/urls';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { apiCall } from '@/store/utils';

// Validation schema with Yup
const validationSchema = Yup.object({
    tournamentId: Yup.string().required('Tournament ID is required'),
    seasonId: Yup.string().required('Season is required'),
    categoryId: Yup.string().required('Category is required'),
    team1_id: Yup.string().required('Team 1 ID is required'),
    team2_id: Yup.string()
        .required('Team 2 ID is required')
        .notOneOf([Yup.ref('team1_id'), null], 'Team 2 ID cannot be the same as Team 1 ID'),
    round_id: Yup.string().required('Round ID is required'),
    pool: Yup.string().required('Pool is required'),
    match_date: Yup.date().required('Match date is required')
});

const CreateMatchScreen = () => {
    const router = useRouter();
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    const formik = useFormik({
        initialValues: {
            tournamentId: '',
            seasonId: '',
            categoryId: '',
            team1_id: '',
            team2_id: '',
            round_id: '',
            pool: '',
            match_date: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                const { tournamentId, seasonId, ...submitValues } = values;
                const response = await fetch(endpoints.createMatch, {
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
                    toast.success('Match created successfully');
                    router.push('/organizer/match-ops');
                } else {
                    throw new Error(resp.error || "Failed to create match");
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
        <div className={stl.createMatchScreen}>
            <h2>Create Match</h2>
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

                <div className={stl.formGroup}>
                    <label>Round ID</label>
                    <input
                        type="text"
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
                <div className={stl.formGroup}>
                    <label>Pool</label>
                    <input
                        type="text"
                        name="pool"
                        value={formik.values.pool}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                    />
                    {formik.touched.pool && formik.errors.pool && (
                        <div className={stl.error}>{formik.errors.pool}</div>
                    )}
                </div>
                <div className={stl.formGroup}>
                    <label>Team 1 ID</label>
                    <input
                        type="text"
                        name="team1_id"
                        value={formik.values.team1_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                    />
                    {formik.touched.team1_id && formik.errors.team1_id && (
                        <div className={stl.error}>{formik.errors.team1_id}</div>
                    )}
                </div>
                <div className={stl.formGroup}>
                    <label>Team 2 ID</label>
                    <input
                        type="text"
                        name="team2_id"
                        value={formik.values.team2_id}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                    />
                    {formik.touched.team2_id && formik.errors.team2_id && (
                        <div className={stl.error}>{formik.errors.team2_id}</div>
                    )}
                </div>
                <div className={stl.formGroup}>
                    <label>Match Date</label>
                    <input
                        type="datetime-local"
                        name="match_date"
                        value={formik.values.match_date}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        required
                    />
                    {formik.touched.match_date && formik.errors.match_date && (
                        <div className={stl.error}>{formik.errors.match_date}</div>
                    )}
                </div>
                <button type="submit">Create Match</button>
                <button type="button" onClick={handleBack} className={stl.backButton}>Cancel</button>
            </form>
        </div>
    );
};

export default CreateMatchScreen;
