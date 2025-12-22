'use client'

import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import stl from "./KnockoutOpsDetail.module.scss";
import { endpoints } from "@/store/urls";
import { apiCall } from "@/store/utils";
import toast from "react-hot-toast";
import KnockoutStandings from "./components/KnockoutStandings";

const KnockoutOpsDetailScreen = () => {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [tournamentMeta, setTournamentMeta] = useState(null);
    const [error, setError] = useState(null);

    const fetchTournamentMeta = async () => {
        try {
            setLoading(true);
            const response = await apiCall(`${endpoints.getTournamentMeta}/${params.id}`);
            
            if (response.error) {
                throw new Error(response.details || response.error);
            }
            
            setTournamentMeta(response);
            setError(null);
        } catch (error) {
            console.error('Error fetching tournament meta:', error);
            const errorMessage = error.message || error.details || 'Failed to fetch tournament details';
            setError(errorMessage);
            toast.error(errorMessage);
            setTournamentMeta(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.id) {
            fetchTournamentMeta();
        }
    }, [params.id]);

    const handleBack = () => {
        router.push("/organizer/match-ops/knockout-ops");
    };

    if (loading) {
        return (
            <div className={stl.container}>
                <div className={stl.content}>
                    <div className={stl.loading}>Loading tournament details...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={stl.container}>
                <div className={stl.content}>
                    <div className={stl.error}>{error}</div>
                    <div className={stl.buttons}>
                        <button className={stl.buttonBack} onClick={handleBack}>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Parse tournament name parts (name~location~format)
    const nameParts = tournamentMeta?.tournament?.name?.split("~") || [];
    const [tournamentName, location, format] = nameParts;

    return (
        <div className={stl.container}>
            <div className={stl.metaBar}>
                <div className={stl.metaContent}>
                    <div className={stl.tournamentInfo}>
                        <h1>{tournamentName}</h1>
                        <div className={stl.details}>
                            <span className={stl.superTournament}>{tournamentMeta?.super_tournament?.name}</span>
                            <span className={stl.divider}>•</span>
                            <span className={stl.type}>{tournamentMeta?.tournament?.type}</span>
                            {format && (
                                <>
                                    <span className={stl.divider}>•</span>
                                    <span className={stl.format}>{format}</span>
                                </>
                            )}
                            {location && (
                                <>
                                    <span className={stl.divider}>•</span>
                                    <span className={stl.location}>{location}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className={stl.actions}>
                        <a 
                            href={`/organizer/match-ops/player-ops/${tournamentMeta?.super_tournament?.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={stl.buttonTeams}
                        >
                            All Teams
                        </a>
                        <button className={stl.buttonBack} onClick={handleBack}>
                            Go Back
                        </button>
                    </div>
                </div>
            </div>

            <div className={stl.content}>
                <div className={stl.standingsContainer}>
                    <KnockoutStandings tournamentId={params.id} />
                </div>
            </div>
        </div>
    );
};

export default KnockoutOpsDetailScreen; 