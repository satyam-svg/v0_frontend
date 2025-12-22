'use client';

import React, { useState, useEffect } from 'react';
import { 
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { endpoints } from '@/store/urls';
import { apiCall } from '@/store/utils';
import toast from 'react-hot-toast';
import styles from './CourtOrders.module.scss';

const SortableMatch = ({ match, index, tournamentDetails }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: match.match_id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1
    };

    // Find team details from tournament details using team name
    const team1Details = tournamentDetails?.teams?.find(team => team.name === match.team1?.name);
    const team2Details = tournamentDetails?.teams?.find(team => team.name === match.team2?.name);

    const formatPlayerNames = (players) => {
        if (!players) return '';
        return players.map(player => 
            `${player.first_name}${player.last_name ? ' ' + player.last_name : ''}`
        ).join(' & ');
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${styles.matchCard} ${isDragging ? styles.dragging : ''}`}
            {...attributes}
            {...listeners}
        >
            <div className={styles.matchHeader}>
                <div className={styles.matchOrder}>#{index + 1}</div>
                <div className={styles.matchId}>Match ID: {match.match_id}</div>
                <div className={styles.status}>{match.status}</div>
            </div>
            <div className={styles.matchDetails}>
                <div className={styles.teams}>
                    <span className={styles.team}>
                        <span className={styles.teamName}>{match.team1?.name || 'TBD'}</span>
                        <span className={styles.players}>
                            {formatPlayerNames(team1Details?.players) || 'Players not assigned'}
                            {team1Details?.all_players_checked_in && <span className={styles.checkedInBadge}>✓</span>}
                        </span>
                    </span>
                    <span className={styles.vs}>vs</span>
                    <span className={styles.team}>
                        <span className={styles.teamName}>{match.team2?.name || 'TBD'}</span>
                        <span className={styles.players}>
                            {formatPlayerNames(team2Details?.players) || 'Players not assigned'}
                            {team2Details?.all_players_checked_in && <span className={styles.checkedInBadge}>✓</span>}
                        </span>
                    </span>
                </div>
                {match.pool && (
                    <div className={styles.poolInfo}>
                        Pool: {match.pool}
                    </div>
                )}
            </div>
        </div>
    );
};

const CourtOrders = ({ tournamentId, numberOfCourts, onReorder, refreshKey }) => {
    const [selectedCourt, setSelectedCourt] = useState(1);
    const [courtMatches, setCourtMatches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeId, setActiveId] = useState(null);
    const [tournamentDetails, setTournamentDetails] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        if (tournamentId) {
            fetchTournamentDetails();
            fetchCourtMatches();
        }
    }, [tournamentId, selectedCourt, refreshKey]);

    const fetchTournamentDetails = async () => {
        try {
            const response = await apiCall(`${endpoints.getTournamentDetails}/${tournamentId}`);
            if (response) {
                setTournamentDetails(response);
            }
        } catch (error) {
            console.error('Error fetching tournament details:', error);
            toast.error('Failed to fetch tournament details');
        }
    };

    const fetchCourtMatches = async () => {
        try {
            setLoading(true);
            const url = endpoints.getCourtMatches
                .replace('{tournament_id}', tournamentId) + 
                `?court_number=${selectedCourt}`;
            
            const response = await apiCall(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response && response.matches) {
                setCourtMatches(response.matches);
            } else {
                setCourtMatches([]);
            }
        } catch (error) {
            console.error('Error fetching court matches:', error);
            toast.error(error.response?.error || 'Failed to fetch court matches');
            setCourtMatches([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = courtMatches.findIndex(match => match.match_id.toString() === active.id);
        const newIndex = courtMatches.findIndex(match => match.match_id.toString() === over.id);

        const newMatches = arrayMove(courtMatches, oldIndex, newIndex);
        setCourtMatches(newMatches);

        try {
            const url = endpoints.reorderCourtMatches.replace('{tournament_id}', tournamentId);
            const matchOrders = newMatches.map((match, index) => ({
                match_id: match.match_id,
                new_order: index + 1
            }));

            const response = await apiCall(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: {
                    court_number: selectedCourt,
                    match_orders: matchOrders
                }
            });

            if (response.message) {
                toast.success('Match order updated successfully');
            }
        } catch (error) {
            console.error('Error reordering matches:', error);
            toast.error('Failed to update match order');
            fetchCourtMatches();
        }
    };

    return (
        <div className={styles.courtOrdersContainer}>
            <h2>Court Order Management</h2>
            
            <div className={styles.courtTabs}>
                {Array.from({ length: numberOfCourts }, (_, i) => i + 1).map(courtNum => (
                    <button
                        key={courtNum}
                        className={`${styles.courtTab} ${selectedCourt === courtNum ? styles.active : ''}`}
                        onClick={() => setSelectedCourt(courtNum)}
                    >
                        Court {courtNum}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className={styles.loading}>Loading matches...</div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className={styles.matchesList}>
                        {courtMatches.length === 0 ? (
                            <div className={styles.noMatches}>
                                No matches assigned to Court {selectedCourt}
                            </div>
                        ) : (
                            <SortableContext
                                items={courtMatches.map(match => match.match_id.toString())}
                                strategy={verticalListSortingStrategy}
                            >
                                {courtMatches.map((match, index) => (
                                    <SortableMatch 
                                        key={match.match_id} 
                                        match={match} 
                                        index={index}
                                        tournamentDetails={tournamentDetails}
                                    />
                                ))}
                            </SortableContext>
                        )}
                    </div>
                    <DragOverlay>
                        {activeId ? (
                            <div className={`${styles.matchCard} ${styles.dragging}`}>
                                {(() => {
                                    const match = courtMatches.find(m => m.match_id.toString() === activeId);
                                    if (!match) return null;
                                    
                                    const index = courtMatches.findIndex(m => m.match_id.toString() === activeId);
                                    const team1Details = tournamentDetails?.teams?.find(team => team.name === match.team1?.name);
                                    const team2Details = tournamentDetails?.teams?.find(team => team.name === match.team2?.name);
                                    
                                    const formatPlayerNames = (players) => {
                                        if (!players) return '';
                                        return players.map(player => 
                                            `${player.first_name}${player.last_name ? ' ' + player.last_name : ''}`
                                        ).join(' & ');
                                    };

                                    return (
                                        <>
                                            <div className={styles.matchHeader}>
                                                <div className={styles.matchOrder}>#{index + 1}</div>
                                                <div className={styles.matchId}>Match ID: {match.match_id}</div>
                                                <div className={styles.status}>{match.status}</div>
                                            </div>
                                            <div className={styles.matchDetails}>
                                                <div className={styles.teams}>
                                                    <span className={styles.team}>
                                                        <span className={styles.teamName}>{match.team1?.name || 'TBD'}</span>
                                                        <span className={styles.players}>
                                                            {formatPlayerNames(team1Details?.players) || 'Players not assigned'}
                                                            {team1Details?.all_players_checked_in && <span className={styles.checkedInBadge}>✓</span>}
                                                        </span>
                                                    </span>
                                                    <span className={styles.vs}>vs</span>
                                                    <span className={styles.team}>
                                                        <span className={styles.teamName}>{match.team2?.name || 'TBD'}</span>
                                                        <span className={styles.players}>
                                                            {formatPlayerNames(team2Details?.players) || 'Players not assigned'}
                                                            {team2Details?.all_players_checked_in && <span className={styles.checkedInBadge}>✓</span>}
                                                        </span>
                                                    </span>
                                                </div>
                                                {match.pool && (
                                                    <div className={styles.poolInfo}>
                                                        Pool: {match.pool}
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    );
};

export default CourtOrders; 