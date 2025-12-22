export const navigateToPlayerRegistration = (tournamentId) => {
    if (!tournamentId) {
        console.error('Tournament ID is required for registration');
        return;
    }
    window.location.href = `/player/register?tournament=${tournamentId}`;
};
