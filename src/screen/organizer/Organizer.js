'use client'

import { useRouter } from "next/navigation";
import stl from "./Organizer.module.scss";
import { Header } from "@/components/header";

const OrganizerScreen = () => {
    const router = useRouter();

    const handleNavigation = (path) => {
        router.push(path);
    };

    return (
        <div>
            <div className={stl.container}>
                <h1>Organizer Dashboard</h1>
                <p>Choose an action to proceed</p>
                <div className={stl.buttons}>
                    <button className={stl.button} onClick={() => handleNavigation("/organizer/tournament-set-up")}>
                        Tournament Set-Up
                    </button>
                    <button className={stl.button} onClick={() => handleNavigation("/organizer/match-ops")}>
                        Match Ops
                    </button>
                    <button className={stl.button} onClick={() => handleNavigation("/organizer/post-match")}>
                        Post-Match
                    </button>
                    {/* <button className={stl.buttonBack} onClick={() => handleNavigation("/")}>
                    Go Back
                </button> */}
                </div>
            </div>
        </div>
    );
};

export default OrganizerScreen;
