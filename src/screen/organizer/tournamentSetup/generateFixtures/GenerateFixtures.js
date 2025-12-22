'use client'
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import stl from "./GenerateFixtures.module.scss";
import toast from "react-hot-toast";
import { endpoints } from "@/store/urls";
import { useRouter } from "next/navigation";
import Image from "next/image";
import CsvFormat from "@public/pool-update-format.png";
import { apiCall } from '@/store/utils';

const GenerateFixturesScreen = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);
    const router = useRouter();

    const formik = useFormik({
        initialValues: {
            file: null,
            tournamentId: "",
            seasonId: "",
            categoryId: "",
            roundId: "",
            roundName: "",
        },
        validationSchema: Yup.object({
            file: Yup.mixed().required("CSV file is required"),
            tournamentId: Yup.string().required("Tournament ID is required"),
            seasonId: Yup.string().required("Season is required"),
            categoryId: Yup.string().required("Category is required"),
            roundId: Yup.number().required("Round ID is required"),
            roundName: Yup.string().required("Round Name is required"),
        }),
        onSubmit: async (values) => {
            try {
                const formData = new FormData();
                formData.append("tournament_id", values.categoryId);
                formData.append("round_id", values.roundId);
                formData.append("round_name", values.roundName);
                formData.append("file", values.file);

                setIsSubmitting(true);

                const response = await fetch(endpoints.generateFixtures, {
                    method: "POST",
                    body: formData,
                });

                const respData = await response.json();

                if (!response.ok) {
                    throw new Error(respData.error || "Failed to upload CSV");
                }
                toast.success("Data registered successfully for the round.");
                router.push("/organizer/tournament-set-up");
            } catch (error) {
                console.error("Error:", error.message);
                toast.error(error.message || "Failed to upload CSV.");
            } finally {
                setIsSubmitting(false);
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
            <h2 className={stl.title}>Generate Fixtures</h2>
            <form onSubmit={formik.handleSubmit} className={stl.form}>
                {/* Tournament Selection Section */}
                <div className={`${stl.formSection} ${stl.tournamentSection}`}>
                    <div className={stl.formGroup}>
                        <label htmlFor="tournamentId">Tournament ID</label>
                        <input
                            id="tournamentId"
                            name="tournamentId"
                            type="text"
                            onChange={handleTournamentChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.tournamentId}
                            className={stl.input}
                            placeholder="Enter Tournament ID"
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
                        <label htmlFor="seasonId">Season</label>
                        <select
                            id="seasonId"
                            name="seasonId"
                            onChange={(e) => {
                                formik.handleChange(e);
                                formik.setFieldValue('categoryId', '');
                            }}
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
                </div>

                {/* Round ID */}
                <div className={stl.formGroup}>
                    <label htmlFor="roundId">Round ID</label>
                    <input
                        id="roundId"
                        name="roundId"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.roundId}
                        className={stl.input}
                    />
                    {formik.touched.roundId && formik.errors.roundId && (
                        <div className={stl.error}>{formik.errors.roundId}</div>
                    )}
                </div>

                {/* Round Name */}
                <div className={stl.formGroup}>
                    <label htmlFor="roundName">Round Name</label>
                    <input
                        id="roundName"
                        name="roundName"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.roundName}
                        className={stl.input}
                        placeholder="e.g., Quarter Finals"
                    />
                    {formik.touched.roundName && formik.errors.roundName && (
                        <div className={stl.error}>{formik.errors.roundName}</div>
                    )}
                </div>

                <div className={stl.refImage}>
                    <Image src={CsvFormat} alt="ref-image" />
                    <h4>Upload csv in this format</h4>
                </div>

                {/* File Upload */}
                <div className={stl.formGroup}>
                    <label htmlFor="file">Upload File (CSV)</label>
                    <input
                        id="file"
                        name="file"
                        type="file"
                        accept=".csv"
                        onChange={(event) => formik.setFieldValue("file", event.target.files[0])}
                        onBlur={formik.handleBlur}
                        className={stl.input}
                    />
                    {formik.touched.file && formik.errors.file && (
                        <div className={stl.error}>{formik.errors.file}</div>
                    )}
                </div>

                {/* Submit Button */}
                <button type="submit" className={stl.submitButton} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit"}
                </button>
                <button 
                    type="button"
                    className={stl.submitButton}
                    style={{ background: "#F28C28" }}
                    onClick={() => router.push("/organizer/tournament-set-up")}
                >
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default GenerateFixturesScreen;
