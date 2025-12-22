'use client'
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import stl from "./Checkin.module.scss"
import { useRouter } from "next/navigation";
import { endpoints } from "@/store/urls";
import toast from "react-hot-toast";
import { apiCall } from '@/store/utils';

const CheckInScreen = () => {
    const [storedCategoryId, setStoredCategoryId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            tournamentId: "",
            seasonId: "",
            categoryId: ""
        },
        validationSchema: Yup.object({
            tournamentId: Yup.string().required("Tournament ID is required"),
            seasonId: Yup.string().required("Season is required"),
            categoryId: Yup.string().required("Category is required")
        }),
        onSubmit: async (values) => {
            try {
                const response = await fetch(`${endpoints.getTournamentDetails}/${values.categoryId}`);

                if (response.ok) {
                    sessionStorage.setItem("CheckinTournamentId", values.categoryId);
                    setStoredCategoryId(values.categoryId);
                    setIsEditing(false);
                    router.push("/organizer/tournament-set-up/teams-check-in/sheet");
                } else {
                    toast.error("Invalid Category ID. Please try again.");
                }
            } catch (error) {
                toast.error("Error fetching tournament details");
                console.error(error);
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

    const handlePathClick = (path) => {
        router.push(`/${path}`);
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    useEffect(() => {
        const savedTournamentId = sessionStorage.getItem("CheckinTournamentId");
        if (savedTournamentId) {
            setStoredCategoryId(savedTournamentId);
        }
    }, []);

    return (
        <div className={stl.container}>
            {storedCategoryId && !isEditing ? (
                <>
                    <h1>Category ID: {storedCategoryId}</h1>
                    <div className={stl.displayContainer}>
                        <button onClick={handleEdit} className={stl.changeButton}>
                            Change Category ID
                        </button>
                        <button onClick={() => handlePathClick('organizer/tournament-set-up/teams-check-in/sheet')}
                            className={stl.changeButton}>
                            Check-in Teams
                        </button>
                        <button onClick={() => handlePathClick('organizer/tournament-set-up')}
                            className={stl.changeButton}
                            style={{background:'#E74C3C'}}>
                            Go Back
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <form onSubmit={formik.handleSubmit} className={stl.form}>
                        <h1>Tournament Selection</h1>
                        <div className={stl.formGroup}>
                            <label htmlFor="tournamentId">Tournament ID</label>
                            <input
                                type="text"
                                name="tournamentId"
                                placeholder="Enter Tournament ID"
                                onChange={handleTournamentChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.tournamentId}
                                className={stl.inputField}
                            />
                            {formik.touched.tournamentId && formik.errors.tournamentId && (
                                <div className={stl.errorMessage}>{formik.errors.tournamentId}</div>
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
                            <label htmlFor="seasonId">Season</label>
                            <select
                                id="seasonId"
                                name="seasonId"
                                onChange={(e) => {
                                    formik.handleChange(e);
                                    formik.setFieldValue('categoryId', '');
                                }}
                                value={formik.values.seasonId}
                                className={stl.inputField}
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
                                <div className={stl.errorMessage}>{formik.errors.seasonId}</div>
                            )}
                        </div>

                        <div className={stl.formGroup}>
                            <label htmlFor="categoryId">Category</label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                onChange={formik.handleChange}
                                value={formik.values.categoryId}
                                className={stl.inputField}
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
                                <div className={stl.errorMessage}>{formik.errors.categoryId}</div>
                            )}
                        </div>

                        <button type="submit" className={stl.submitButton}>
                            Check-in Teams
                        </button>
                    </form>
                </>
            )}
        </div>
    );
};

export default CheckInScreen;
