# Tournament Management System (Frontend)

This is the frontend application for the Tournament Management System, built with [Next.js](https://nextjs.org). It provides interfaces for tournament organizers, referees, and public viewers to manage and track tournament progress.

## Features

*   **Tournament Fixtures:** View match schedules, pools, and brackets.
*   **Referee Interface:** Manage match scores, status, and outcomes.
*   **Live Updates:** Real-time score updates and status changes.
*   **Walkover Management:** Ability to mark matches as walkovers with designated winners.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Recent Updates: Walkover Functionality

We have recently added the ability to handle **Walkover** matches. This ensures that matches where one team fails to show up or forfeits can be correctly recorded and displayed.

### Key Changes

1.  **Match Entry (Referee)**
    *   Referees can now toggle between "Normal Match" and "Walkover" in the match update screen.
    *   For walkovers, score inputs are disabled, and the referee simply selects the winning team.
    *   The system automatically records the score as "0-0" and sets the outcome to 'walkover'.

2.  **Visual Indicators**
    *   **"WO" Badge:** A distinct orange badge appears on match cards for walkover matches.
    *   **Winner Icon:** A Crown icon (👑) is displayed next to the winning team's name.
    *   **Score Display:** Scores for walkover matches are shown as **"W"** (Winner) and **"-"** (Loser).

3.  **Technical Implementation**
    *   The system is designed to be robust, handling case-insensitive outcome data (e.g., "Walkover", "walkover").
    *   The implementation is scalable, allowing for future addition of other match states like "Forfeit" or "Bye" with minimal code changes.

## Project Structure

*   `src/components/fixtures`: Contains components for displaying tournament fixtures (User and Referee views).
*   `src/screen/referee`: Contains screens specific to the referee interface (Match Entry, etc.).
*   `src/store`: Redux store and API utility functions.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
