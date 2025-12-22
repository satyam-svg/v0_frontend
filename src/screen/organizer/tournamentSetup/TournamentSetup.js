'use client'

import { useRouter } from "next/navigation";
import stl from "./TournamentSetup.module.scss";

const TournamentSetupScreen = () => {
    const router = useRouter();

    const handleNavigation = (path) => {
        router.push(path);
    };

    return (
        <div className={stl.container}>
            <h1>Tournament <br /> Set-up</h1>
            <p>Choose an action to proceed</p>
            <div className={stl.buttons}>
                <button 
                    className={stl.button} 
                    onClick={() => handleNavigation("/organizer/tournament-set-up/create-super-tournament")}
                >
                    Create Tournament
                </button>
                <button 
                    className={stl.button} 
                    onClick={() => handleNavigation("/organizer/tournament-set-up/create-tournament")}
                >
                    Create Category
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/tournament-set-up/register-teams")}>
                    Register Teams
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/tournament-set-up/generate-fixtures")}>
                    Generate Fixtures
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/tournament-set-up/teams-check-in")}>
                   Team Check-in
                </button>
                <button className={stl.buttonBack} onClick={() => handleNavigation("/organizer")}>
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default TournamentSetupScreen;
