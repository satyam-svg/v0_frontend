'use client'

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import stl from "./PostMatch.module.scss";
import toast from "react-hot-toast";
import { endpoints } from "@/store/urls";
import { apiCall } from "@/store/utils";

const PostMatchScreen = () => {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    const formik = useFormik({
        initialValues: {
            tournamentId: "",
            seasonId: "",
            categoryId: ""
        },
        validationSchema: Yup.object({
            tournamentId: Yup.string().required('Tournament ID is required'),
            seasonId: Yup.string().when('tournamentId', {
                is: (val) => val && val.length > 0,
                then: () => Yup.string().required('Season is required')
            }),
            categoryId: Yup.string().when('seasonId', {
                is: (val) => val && val.length > 0,
                then: () => Yup.string().required('Category is required')
            })
        }),
        onSubmit: async (values) => {
            try {
                setLoading(true);
                const response = await fetch(`${endpoints.downloadDuprReport}?tournament_id=${values.categoryId}`, {
                    method: 'GET',
                });
                if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "DUPR_Report.csv";
                    a.click();
                    setShowModal(false);
                } else {
                    const resp = await response.json()
                    toast.error(resp?.error || "Failed to download report");
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error("Failed to download report");
            } finally {
                setLoading(false);
            }
        },
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

    return (
        <div className={stl.container}>
            <h1>Post-Match Actions</h1>
            <p>Choose an action to proceed</p>
            <div className={stl.buttons}>
                <button className={stl.button} onClick={() => setShowModal(true)}>
                    Download DUPR Reports
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/post-match/leaderboard")}>
                    Leaderboard
                </button>
                <button className={stl.buttonBack} onClick={() => handleNavigation("/organizer")}>
                    Go Back
                </button>
            </div>

            {showModal && (
                <div className={stl.modal}>
                    <div className={stl.modalContent}>
                        <h2>Download DUPR Report</h2>
                    <form onSubmit={formik.handleSubmit} className={stl.form}>
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
                                    onBlur={formik.handleBlur}
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
                                    onBlur={formik.handleBlur}
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

                            <div className={stl.buttonGroup}>
                                <button type="submit" className={stl.submitButton} disabled={loading}>
                                    {loading ? 'Downloading...' : 'Download'}
                        </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowModal(false);
                                        formik.resetForm();
                                        setTournament(null);
                                    }} 
                                    className={stl.cancelButton}
                                >
                            Cancel
                        </button>
                            </div>
                    </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostMatchScreen;
