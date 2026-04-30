const apiUrls = {
    nba: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
    mlb: 'https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard',
    epl: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
};

const chatLog = {};

async function loadScores(sport) {
    const container = document.getElementById('scores');

    container.innerHTML = `
        <div class="empty">
            <h3>Loading...</h3>
        </div>`;

    try {
        const response = await fetch(apiUrls[sport]);
        const result = await response.json();
        const events = result.events;

        container.innerHTML = '';

        if (!events || events.length === 0) {
            container.innerHTML = '<div class="empty"><h3>No games today</h3></div>';
            return;
        }

        events.forEach(event => {
            const comp = event.competitions[0];
            const home = comp.competitors.find(c => c.homeAway === 'home');
            const away = comp.competitors.find(c => c.homeAway === 'away');

            const gameDiv = document.createElement('div');
            gameDiv.className = 'game-row';
            gameDiv.style.cursor = 'pointer';
            gameDiv.onclick = () => window.open(event.links?.[0]?.href || 'https://www.espn.com', '_blank');

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
        container.innerHTML = '<div class="empty"><h3>Failed to load</h3><p>' + error.message + '</p></div>';
    }
}

function switchChannel(el, key, title) {
    document.querySelectorAll('.channel').forEach(c => c.classList.remove('active'));
    el.classList.add('active');

    document.getElementById('channelName').textContent = title;
    document.getElementById('chatInput').placeholder = 'Message ' + title + '...';

    const container = document.getElementById('scores');

    if (apiUrls[key]) {
        loadScores(key);
    } else {
        const msgs = chatLog[key] || [];
        if (msgs.length > 0) {
            container.innerHTML = msgs.map(msg => '<div class="chat-message"><span>Me</span>' + msg + '</div>').join('');
        } else {
            container.innerHTML = `<div class="empty"><h3>${title}</h3><p>No messages yet.</p></div>`;
        }
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    const channel = document.querySelector('.channel.active').dataset.channel;
    if (!text) return;

    if (!chatLog[channel]) chatLog[channel] = [];
    chatLog[channel].push(text);

    const container = document.getElementById('scores');
    const empty = container.querySelector('.empty');
    if (empty) empty.remove();

    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message';
    msgDiv.innerHTML = '<span>Me</span><span class="msg-time">' + time + '</span>' + text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;

    input.value = '';
}

document.getElementById('chatInput').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.isComposing) {
        e.preventDefault();
        sendMessage();
    }
});

if (document.querySelector('.channel.active').dataset.channel === 'nba') {
    loadScores('nba');
}