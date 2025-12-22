import React, { useState } from 'react';
import Fixtures from './Fixtures';
import styles from './CourtManagementFixtures.module.scss';

const TABS = {
    UNASSIGNED: 'unassigned',
    ASSIGNED: 'assigned',
    PENDING: 'pending'
};

const CourtManagementFixtures = ({ 
    tournamentId,
    numberOfCourts,
    onMatchClick,
    selectedPool,
    onPoolChange,
    refreshKey
}) => {
    const [activeTab, setActiveTab] = useState(TABS.UNASSIGNED);
    const [selectedRound, setSelectedRound] = useState(null);
    const [selectedPoolId, setSelectedPoolId] = useState(null);

    const getMatchFilter = (tab) => {
        const baseFilter = (match) => {
            const roundMatches = !selectedRound || match.round_id === selectedRound;
            const poolMatches = !selectedPoolId || match.pool === selectedPoolId;
            return roundMatches && poolMatches;
        };

        switch (tab) {
            case TABS.UNASSIGNED:
                return (match) => !match.court_number && 
                                match.team1_checked_in && 
                                match.team2_checked_in && 
                                baseFilter(match);
            case TABS.ASSIGNED:
                return (match) => match.court_number && baseFilter(match);
            case TABS.PENDING:
                return (match) => match.status === 'pending' && baseFilter(match);
            default:
                return baseFilter;
        }
    };

    const handleRoundChange = (roundId) => {
        setSelectedRound(roundId);
    };

    const handlePoolChange = (poolId) => {
        setSelectedPoolId(poolId);
        onPoolChange?.(poolId);
    };

    return (
        <div className={styles.courtManagementContainer}>
            <div className={styles.tabs}>
                <button 
                    className={`${styles.tab} ${activeTab === TABS.UNASSIGNED ? styles.active : ''}`}
                    onClick={() => setActiveTab(TABS.UNASSIGNED)}
                >
                    Unassigned Matches
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === TABS.ASSIGNED ? styles.active : ''}`}
                    onClick={() => setActiveTab(TABS.ASSIGNED)}
                >
                    Assigned Matches
                </button>
                <button 
                    className={`${styles.tab} ${activeTab === TABS.PENDING ? styles.active : ''}`}
                    onClick={() => setActiveTab(TABS.PENDING)}
                >
                    Pending Matches
                </button>
            </div>

            <div className={styles.commonFilters}>
                <Fixtures
                    tournamentId={tournamentId}
                    onMatchClick={onMatchClick}
                    showCourtInfo={true}
                    selectedPool={selectedPoolId}
                    onPoolChange={handlePoolChange}
                    selectedRound={selectedRound}
                    onRoundChange={handleRoundChange}
                    courtManagement={true}
                    refreshKey={refreshKey}
                    matchFilter={getMatchFilter(activeTab)}
                    groupByCourt={activeTab === TABS.ASSIGNED}
                    showOnlyFilters={true}
                />
            </div>

            <div className={styles.fixturesContainer}>
                <Fixtures
                    tournamentId={tournamentId}
                    onMatchClick={onMatchClick}
                    showCourtInfo={true}
                    selectedPool={selectedPoolId}
                    selectedRound={selectedRound}
                    courtManagement={true}
                    refreshKey={refreshKey}
                    matchFilter={getMatchFilter(activeTab)}
                    groupByCourt={activeTab === TABS.ASSIGNED}
                    hideFilters={true}
                />
            </div>
        </div>
    );
};

export default CourtManagementFixtures; 