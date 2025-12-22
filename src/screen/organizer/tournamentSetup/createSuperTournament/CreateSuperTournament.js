'use client'
import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { apiCall } from '@/store/utils';
import { endpoints } from '@/store/urls';
import stl from './CreateSuperTournament.module.scss';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Dialog } from "@mui/material";

const CreateSuperTournament = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [seasons, setSeasons] = useState([{ name: '' }]);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [createdTournament, setCreatedTournament] = useState(null);

    const validationSchema = Yup.object({
        name: Yup.string()
            .required('Super Tournament name is required')
            .min(3, 'Name must be at least 3 characters'),
        description: Yup.string()
            .required('Description is required')
            .min(10, 'Description must be at least 10 characters'),
    });

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
        },
        validationSchema,
        onSubmit: async (values) => {
            try {
                setLoading(true);

                // Validate that at least one season has a name
                if (!seasons.some(season => season.name.trim())) {
                    throw new Error('At least one season name is required');
                }

                // Create super tournament with seasons
                const response = await apiCall(endpoints.createSuperTournament, {
                    method: 'POST',
                    body: {
                        name: values.name,
                        description: values.description,
                        seasons: seasons.filter(season => season.name.trim())
                    }
                });

                if (!response.super_tournament) {
                    throw new Error('Invalid response from server');
                }

                setCreatedTournament(response.super_tournament);
                setShowSuccessDialog(true);
                toast.success('Super Tournament created successfully');
            } catch (error) {
                console.error('Error creating super tournament:', error);
                toast.error(error.message || 'Failed to create super tournament');
            } finally {
                setLoading(false);
            }
        }
    });

    const handleClose = () => {
        setShowSuccessDialog(false);
        router.push('/organizer/tournament-set-up');
    };

    const addSeason = () => {
        setSeasons([...seasons, { name: '' }]);
    };

    const removeSeason = (indexToRemove) => {
        if (seasons.length > 1) {
            setSeasons(seasons.filter((_, index) => index !== indexToRemove));
        }
    };

    return (
        <div className={stl.container}>
            <h2>Create Tournament</h2>
            
            {/* Success Dialog */}
            <Dialog open={showSuccessDialog} onClose={handleClose}>
                <div className={stl.dialogContent}>
                    <h3>Tournament Created Successfully!</h3>
                    <div className={stl.tournamentInfo}>
                        <p><strong>Tournament ID:</strong> {createdTournament?.id}</p>
                        <p><strong>Name:</strong> {createdTournament?.name}</p>
                        <div className={stl.seasonsInfo}>
                            <p><strong>Seasons:</strong></p>
                            <ul>
                                {createdTournament?.seasons.map(season => (
                                    <li key={season.id}>
                                        {season.name} (ID: {season.id})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <button 
                        onClick={handleClose}
                        className={stl.doneButton}
                    >
                        Done
                    </button>
                </div>
            </Dialog>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className={stl.form}>
                {/* Super Tournament Details */}
                <div className={stl.formGroup}>
                    <label htmlFor="name">Tournament Name</label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.name}
                        className={stl.input}
                    />
                    {formik.touched.name && formik.errors.name && (
                        <div className={stl.error}>{formik.errors.name}</div>
                    )}
                </div>

                <div className={stl.formGroup}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.description}
                        className={stl.input}
                    />
                    {formik.touched.description && formik.errors.description && (
                        <div className={stl.error}>{formik.errors.description}</div>
                    )}
                </div>

                {/* Seasons Section */}
                <div className={stl.seasonsSection}>
                    <div className={stl.seasonHeader}>
                        <h3>Seasons</h3>
                        <button 
                            type="button" 
                            onClick={addSeason} 
                            className={stl.addButton}
                        >
                            Add Season
                        </button>
                    </div>
                    
                    {seasons.map((season, index) => (
                        <div key={index} className={stl.seasonGroup}>
                            <div className={stl.seasonNumber}>{index + 1}</div>
                            <div className={stl.seasonContent}>
                                <input
                                    type="text"
                                    placeholder="Season Name"
                                    value={season.name}
                                    onChange={(e) => {
                                        const newSeasons = [...seasons];
                                        newSeasons[index].name = e.target.value;
                                        setSeasons(newSeasons);
                                    }}
                                    className={stl.input}
                                />
                                {seasons.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSeason(index)}
                                        className={stl.removeButton}
                                        title="Remove Season"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <button 
                    type="submit" 
                    className={stl.submitButton} 
                    disabled={loading || !seasons.some(season => season.name.trim())}
                >
                    {loading ? 'Creating...' : 'Create Super Tournament'}
                </button>
            </form>
        </div>
    );
};

export default CreateSuperTournament; 