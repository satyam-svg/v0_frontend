'use client'
import { Details } from "@/components/details";
import { endpoints } from "@/store/urls";
import { apiCall } from "@/store/utils";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";



const CheckInSheet = () => {
    const [tournamentId, setTournamentId] = useState();
    const [data, setData] = useState();

    const router = useRouter();
    const getTournamentDetails = async (tournament_id) => {
        try {
            const url = endpoints.getTournamentDetails + `/${tournament_id}`
            const data = await apiCall(url);
            setData(data);
        } catch (error) {
            console.log("Failed to fetch details:", error.message);
        }
    }


    useEffect(() => {
        const savedTournamentId = sessionStorage.getItem("CheckinTournamentId");
        if (savedTournamentId) {
            setTournamentId(savedTournamentId);
        }
    }, []);

    useEffect(() => {
        getTournamentDetails(tournamentId);
    }, [tournamentId])

    return (
        <div>
            <button style={{
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: '#fff',
                backgroundColor: '#007BFF',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            onClick={()=>router.push("/organizer/tournament-set-up/teams-check-in")}
            >Back</button>

            <Details tournament_id={tournamentId} checkin />
        </div >
    )
}

export default CheckInSheet