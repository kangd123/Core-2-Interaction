const nbaData = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
 
async function loadScores() {
    const container = document.getElementById('scores');
 
    container.innerHTML = `
        <div class="empty">
            <div class="icon">🏀</div>
            <h3>Loading...</h3>
        </div>`;
 
    try {
        const response = await fetch(nbaData);
        const result = await response.json();
        const events = result.events;
 
        container.innerHTML = '';
 
        if (!events) {
            console.error('No events found in the API response.');
            return;
        }
 
        events.forEach(event => {
            const home = event.competitions[0].competitors.find(c => c.homeAway === 'home');
            const away = event.competitions[0].competitors.find(c => c.homeAway === 'away');
 
            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-row';

            gameDiv.style.cursor = 'pointer';
            gameDiv.onclick = () => window.open(`https://www.espn.com/nba/game/_/gameId/${event.id}`, '_blank');
 
            gameDiv.innerHTML = `
                <div class="game-status">${event.status.type.shortDetail}</div>
                <div class="game-teams">
                    <div class="team-row">
                        <img class="team-logo" src="${home.team.logo}" />
                        <div class="team-name">${home.team.displayName}</div>
                        <div class="game-score">${home.score}</div>
                    </div>
                    <div class="team-row">
                        <img class="team-logo" src="${away.team.logo}" />
                        <div class="team-name">${away.team.displayName}</div>
                        <div class="game-score">${away.score}</div>
                    </div>
                </div>`;
 
            container.appendChild(gameDiv);
        });
 
    } catch (error) {
        console.error('Error:', error);
    }
}
 
loadScores();