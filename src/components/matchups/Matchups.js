import stl from "./Matchups.module.scss";

const generateRoundsData = (totalRounds) => {
    const rounds = [];

    if (totalRounds >= 5) {
        rounds.push({
            roundName: "Pre-Quarterfinals",
            matchups: [
                { label: "PQ 1", teams: ["A1", "D2"] }, // Pool A vs Pool D Runners-Up
                { label: "PQ 2", teams: ["B1", "C2"] }, // Pool B vs Pool C Runners-Up
                { label: "PQ 3", teams: ["E1", "H2"] }, // Pool E vs Pool H Runners-Up
                { label: "PQ 4", teams: ["F1", "G2"] }, // Pool F vs Pool G Runners-Up
                { label: "PQ 5", teams: ["A2", "D1"] }, // Pool A Runners-Up vs Pool D Winner
                { label: "PQ 6", teams: ["C1", "B2"] }, // Pool C vs Pool B Runners-Up
                { label: "PQ 7", teams: ["E2", "H1"] }, // Pool E Runners-Up vs Pool H Winner
                { label: "PQ 8", teams: ["F2", "G1"] }  // Pool F Runners-Up vs Pool G Winner
            ]
        });
    }

    if (totalRounds >= 4) {
        rounds.push({
            roundName: "Quarterfinals",
            matchups: [
                { label: "QF 1", teams: totalRounds >= 5 ? ["PQ 1", "PQ 2"] : ["A1", "D2"] },
                { label: "QF 2", teams: totalRounds >= 5 ? ["PQ 3", "PQ 4"] : ["B1", "C2"] },
                { label: "QF 3", teams: totalRounds >= 5 ? ["PQ 5", "PQ 6"] : ["C1", "B2"] },
                { label: "QF 4", teams: totalRounds >= 5 ? ["PQ 7", "PQ 8"] : ["D1", "A2"] }
            ]
        });
    }

    if (totalRounds >= 3) {
        rounds.push({
            roundName: "Semifinals",
            matchups: [
                { label: "SF 1", teams: totalRounds >= 4 ? ["QF 1", "QF 2"] : ["A1", "A2"] },
                { label: "SF 2", teams: totalRounds >= 4 ? ["QF 3", "QF 4"] : ["B1", "B2"] }
            ]
        });
    }

    rounds.push({
        roundName: "Final",
        matchups: [
            { label: "Final", teams: totalRounds >= 3 ? ["SF 1", "SF 2"] : ["A1", "B1"] }
        ]
    });

    return rounds;
};


const Matchups = ({ totalRounds }) => {
    console.log(totalRounds)
    const roundsData = generateRoundsData(totalRounds);

    return (
        <div className={stl.matchupsContainer}>
            <h2>Playoff Bracket</h2>
            <div className={stl.rounds}>
                {roundsData.map((round, roundIndex) => (
                    <div key={roundIndex} className={stl.round}>
                        {/* <h3>{round.roundName}</h3> */}
                        {round.matchups.map((matchup, matchupIndex) => (
                            <div key={matchupIndex} className={stl.matchup}>
                                <div className={stl.label}>{matchup.label}</div>
                                <div className={stl.teams}>
                                    <span>{matchup.teams[0]}</span> <span className={stl.vs}>vs</span> <span>{matchup.teams[1]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Matchups;
