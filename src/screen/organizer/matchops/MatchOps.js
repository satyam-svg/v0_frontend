'use client'

import { useRouter } from "next/navigation";
import stl from "./MatchOps.module.scss";

const MatchOpsScreen = () => {
    const router = useRouter();

    const handleNavigation = (path) => {
        router.push(path);
    };

    return (
        <div className={stl.container}>
            <h1>Match Ops</h1>
            <p>Choose an action to proceed</p>
            <div className={stl.buttons}>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/match-ops/create-round")}>
                    Create Round
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/match-ops/create-match")}>
                    Create Match
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/match-ops/complete-round")}>
                    Complete Round
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/match-ops/create-knockout")}>
                    Create Knockout
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/match-ops/pool-ops")}>
                    Pool Management
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/match-ops/knockout-ops")}>
                    Knockout Management
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/match-ops/player-ops")}>
                    Player Management
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/match-ops/court-management")}>
                    Court Management
                </button>
                <button className={stl.button} onClick={() => handleNavigation("/organizer/tournament")}>
                    Fixtures and Standings
                </button>

                <button className={stl.buttonBack} onClick={() => handleNavigation("/organizer")}>
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default MatchOpsScreen;
