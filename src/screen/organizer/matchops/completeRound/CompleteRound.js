'use client'

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import stl from "./CompleteRound.module.scss";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, 
         RadioGroup, Radio, FormControlLabel, FormControl, FormLabel } from "@mui/material";
import { useRouter } from "next/navigation";
import { endpoints } from "@/store/urls";
import toast from "react-hot-toast";
import { apiCall } from "@/store/utils";

const validationSchema = Yup.object({
    tournamentId: Yup.string().required("Tournament ID is required"),
    seasonId: Yup.string().required("Season is required"),
    categoryId: Yup.string().required("Category is required"),
    round: Yup.number()
        .required("Round ID is required")
        .positive("Round must be a positive number")
        .integer("Round must be an integer"),
    nextRoundName: Yup.string()
        .required("Next round name is required"),
    promotionType: Yup.string()
        .required("Promotion type is required")
        .oneOf(['pool_based', 'leaderboard_based', 'custom']),
    matchmakingType: Yup.string().when('promotionType', {
        is: 'pool_based',
        then: () => Yup.string()
            .required("Matchmaking type is required for pool-based promotion")
            .oneOf(['samepool', 'nearpool', 'farpool']),
        otherwise: () => Yup.string().nullable()
    }),
    teamsToPromote: Yup.number().when('promotionType', {
        is: (val) => val === 'pool_based' || val === 'leaderboard_based',
        then: () => Yup.number()
            .required("Number of teams to promote is required")
            .positive("Number must be a positive number")
            .integer("Number must be an integer"),
        otherwise: () => Yup.number().nullable()
    }),
    customMatches: Yup.array().when('promotionType', {
        is: 'custom',
        then: () => Yup.array().of(
            Yup.array().of(Yup.string())
        ).test('valid-matches', 'All matches must have both teams selected', function(value) {
            if (!value) return true;
            return value.every(match => 
                Array.isArray(match) && 
                match.length === 2 && 
                match[0] && 
                match[1] && 
                match[0] !== match[1]
            );
        }),
        otherwise: () => Yup.array().nullable()
    })
});

const CompleteRoundScreen = () => {
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");
    const [showFixtures, setShowFixtures] = useState(false);
    const [fixtures, setFixtures] = useState([]);
    const [customMatchCount, setCustomMatchCount] = useState(0);
    const router = useRouter();
    const [tournament, setTournament] = useState(null);
    const [typingTimeout, setTypingTimeout] = useState(null);

    const formik = useFormik({
        initialValues: {
            tournamentId: "",
            seasonId: "",
            categoryId: "",
            round: "",
            nextRoundName: "",
            promotionType: "pool_based",
            matchmakingType: "samepool",
            teamsToPromote: "",
            customMatches: []
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            const requestData = {
                tournament_id: values.categoryId,
                round_id: values.round,
                next_round_name: values.nextRoundName,
                promotion_type: values.promotionType,
            };

            switch (values.promotionType) {
                case 'custom':
                    requestData.custom_matches = values.customMatches;
                    break;
                case 'leaderboard_based':
                    requestData.teams_to_promote = values.teamsToPromote;
                    break;
                case 'pool_based':
                    requestData.teams_to_promote = values.teamsToPromote;
                    requestData.matchmaking_type = values.matchmakingType;
                    break;
            }

            try {
                setLoading(true);
                const response = await fetch(endpoints.completeRound, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestData),
                });

                const data = await response.json();

                if (response.ok) {
                    setFixtures(data.fixtures);
                    setShowFixtures(true);
                    setDialogMessage("Round completed successfully!");
                    setDialogOpen(true);
                } else {
                    throw new Error(data.message || "Failed to complete round");
                }
            } catch (error) {
                toast.error(error.message);
                console.error("Error completing round:", error);
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

    // Custom matches form handling
    const handleCustomMatchCountChange = (count) => {
        setCustomMatchCount(parseInt(count));
        const newMatches = Array(parseInt(count)).fill(null).map(() => ['', '']);
        formik.setFieldValue('customMatches', newMatches);
    };

    const handleCustomMatchTeamChange = (matchIndex, teamIndex, value) => {
        const newMatches = formik.values.customMatches.map((match, idx) => {
            if (idx === matchIndex) {
                const newMatch = [...(match || ['', ''])];
                newMatch[teamIndex] = value;
                return newMatch;
            }
            return match || ['', ''];
        });
        formik.setFieldValue('customMatches', newMatches);
    };

    return (
        <div className={stl.container}>
            <h2 className={stl.title}>Complete Round</h2>
            {tournament && (
                <h3 className={stl.tournamentName}>Tournament: {tournament.name}</h3>
            )}
            <form onSubmit={formik.handleSubmit} className={stl.form}>
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
                </div>

                <div className={stl.sideBySideContainer}>
                    <div className={stl.formGroup}>
                        <label htmlFor="round">Round to Promote</label>
                        <input
                            id="round"
                            name="round"
                            type="number"
                            {...formik.getFieldProps('round')}
                            className={stl.input}
                            placeholder="Enter round ID"
                        />
                        {formik.touched.round && formik.errors.round && (
                            <div className={stl.error}>{formik.errors.round}</div>
                        )}
                    </div>
                </div>

                <div className={stl.formGroup}>
                    <label htmlFor="nextRoundName">Next Round Name</label>
                    <input
                        id="nextRoundName"
                        name="nextRoundName"
                        type="text"
                        {...formik.getFieldProps('nextRoundName')}
                        className={stl.input}
                        placeholder="e.g., Quarter Finals"
                    />
                    {formik.touched.nextRoundName && formik.errors.nextRoundName && (
                        <div className={stl.error}>{formik.errors.nextRoundName}</div>
                    )}
                </div>

                <div className={stl.sideBySideContainer}>
                    <FormControl component="fieldset" className={stl.formGroup}>
                        <FormLabel component="legend">Promotion Type</FormLabel>
                        <RadioGroup
                            name="promotionType"
                            value={formik.values.promotionType}
                            onChange={(e) => {
                                formik.setFieldValue('promotionType', e.target.value);
                                if (e.target.value !== 'pool_based') {
                                    formik.setFieldValue('matchmakingType', '');
                                }
                                if (e.target.value === 'custom') {
                                    formik.setFieldValue('teamsToPromote', '');
                                }
                            }}
                        >
                            <FormControlLabel 
                                value="pool_based" 
                                control={<Radio />} 
                                label="Pool Based" 
                            />
                            <FormControlLabel 
                                value="leaderboard_based" 
                                control={<Radio />} 
                                label="Leaderboard Based" 
                            />
                            <FormControlLabel 
                                value="custom" 
                                control={<Radio />} 
                                label="Custom" 
                            />
                        </RadioGroup>
                    </FormControl>

                    {formik.values.promotionType === 'pool_based' && (
                        <FormControl component="fieldset" className={stl.formGroup}>
                            <FormLabel component="legend">Matchmaking Type</FormLabel>
                            <RadioGroup
                                name="matchmakingType"
                                value={formik.values.matchmakingType}
                                onChange={formik.handleChange}
                            >
                                <FormControlLabel 
                                    value="samepool" 
                                    control={<Radio />} 
                                    label="Same Pool" 
                                />
                                <FormControlLabel 
                                    value="nearpool" 
                                    control={<Radio />} 
                                    label="Near Pool" 
                                />
                                <FormControlLabel 
                                    value="farpool" 
                                    control={<Radio />} 
                                    label="Far Pool" 
                                />
                            </RadioGroup>
                        </FormControl>
                    )}
                </div>

                {formik.values.promotionType !== 'custom' && (
                    <div className={stl.formGroup}>
                        <label htmlFor="teamsToPromote">Number of Teams to Promote</label>
                        <input
                            id="teamsToPromote"
                            name="teamsToPromote"
                            type="number"
                            {...formik.getFieldProps('teamsToPromote')}
                            className={stl.input}
                        />
                        {formik.touched.teamsToPromote && formik.errors.teamsToPromote && (
                            <div className={stl.error}>{formik.errors.teamsToPromote}</div>
                        )}
                    </div>
                )}

                {formik.values.promotionType === 'custom' && (
                    <div className={stl.formGroup}>
                        <label>Number of Custom Matches</label>
                        <input
                            type="number"
                            value={customMatchCount}
                            onChange={(e) => handleCustomMatchCountChange(e.target.value)}
                            className={stl.input}
                        />
                        {customMatchCount > 0 && (
                            <div className={stl.customMatchesContainer}>
                                {Array.from({ length: customMatchCount }).map((_, idx) => (
                                    <div key={idx} className={stl.customMatch}>
                                        <input
                                            type="text"
                                            placeholder="Team 1"
                                            value={formik.values.customMatches[idx]?.[0] || ''}
                                            onChange={(e) => handleCustomMatchTeamChange(idx, 0, e.target.value)}
                                            className={stl.input}
                                        />
                                        <span>vs</span>
                                        <input
                                            type="text"
                                            placeholder="Team 2"
                                            value={formik.values.customMatches[idx]?.[1] || ''}
                                            onChange={(e) => handleCustomMatchTeamChange(idx, 1, e.target.value)}
                                            className={stl.input}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button type="submit" className={stl.submitButton} disabled={loading}>
                    {loading ? "Processing..." : "Complete Round"}
                </button>
            </form>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Success</DialogTitle>
                <DialogContent>
                    <p>{dialogMessage}</p>
                    {showFixtures && (
                        <div>
                            <h4>Generated Fixtures:</h4>
                            <ul>
                                {fixtures.map((fixture, index) => (
                                    <li key={index}>{`${fixture.team1} vs ${fixture.team2}`}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setDialogOpen(false);
                        router.push('/organizer/match-ops');
                    }}>
                        Done
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default CompleteRoundScreen;
