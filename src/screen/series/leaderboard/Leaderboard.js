'use client'

import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import styles from "./Leaderboard.module.scss"

const columns = [
    { id: 'rank', label: 'Rank', minWidth: 50 },
    { id: 'teamName', label: 'Team Name', minWidth: 130 },
    { id: 'points', label: 'Points', minWidth: 100 },
    { id: 'matchesWon', label: 'Matches Won', minWidth: 100 },
    { id: 'matchesLost', label: 'Matches Lost', minWidth: 100 },
];

const rows = [
    { teamName: 'Team A', points: 45, matchesWon: 15, matchesLost: 5 },
    { teamName: 'Team B', points: 40, matchesWon: 13, matchesLost: 7 },
    { teamName: 'Team C', points: 35, matchesWon: 12, matchesLost: 8 },
    { teamName: 'Team D', points: 30, matchesWon: 10, matchesLost: 10 },
    { teamName: 'Team E', points: 25, matchesWon: 9, matchesLost: 11 },
    { teamName: 'Team F', points: 20, matchesWon: 7, matchesLost: 13 },
    { teamName: 'Team G', points: 18, matchesWon: 6, matchesLost: 14 },
    { teamName: 'Team H', points: 15, matchesWon: 5, matchesLost: 15 },
    { teamName: 'Team H', points: 15, matchesWon: 5, matchesLost: 15 },
    { teamName: 'Team H', points: 15, matchesWon: 5, matchesLost: 15 },
    { teamName: 'Team H', points: 15, matchesWon: 5, matchesLost: 15 },
    { teamName: 'Team H', points: 15, matchesWon: 5, matchesLost: 15 },
    { teamName: 'Team H', points: 15, matchesWon: 5, matchesLost: 15 },
    { teamName: 'Team H', points: 15, matchesWon: 5, matchesLost: 15 },
   
];

const sortedRows = rows.sort((a, b) => b.points - a.points);

export default function LeaderboardScreen() {
    return (
        <div className={styles.leaderboardContainer}>
            <h1 className={styles.seriesTitle}>Series Name</h1>

            {/* Podium Section */}
            <div className={styles.podium}>
                <div className={styles.podiumSpot}>
                    <div className={styles.podiumRank}>1st</div>
                    <div className={styles.podiumTeam}>{sortedRows[0].teamName}</div>
                    <div className={styles.podiumPoints}>{sortedRows[0].points} pts</div>
                </div>
                <div className={styles.podiumSpot}>
                    <div className={styles.podiumRank}>2nd</div>
                    <div className={styles.podiumTeam}>{sortedRows[1].teamName}</div>
                    <div className={styles.podiumPoints}>{sortedRows[1].points} pts</div>
                </div>
                <div className={styles.podiumSpot}>
                    <div className={styles.podiumRank}>3rd</div>
                    <div className={styles.podiumTeam}>{sortedRows[2].teamName}</div>
                    <div className={styles.podiumPoints}>{sortedRows[2].points} pts</div>
                </div>
            </div>

            {/* Table Section */}
            <Paper className={styles.tableWrapper}>
                <TableContainer sx={{ height: "60vh" }}>
                    <Table stickyHeader style={{fontFamily:"Nunito"}}>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        className={` ${styles.headerCell}`}
                                        style={{
                                            minWidth: column.minWidth,
                                        }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedRows.map((row, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={index} className={styles.bodyRow}>
                                    <TableCell>{index + 1}</TableCell>
                                    {columns.slice(1).map((column) => (
                                        <TableCell key={column.id} className={`${column.id === 'teamName' ? styles.stickyColumn : ''} ${styles.bodyCell}`}>
                                            {row[column.id]}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </div>
    );
}
