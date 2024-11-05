class GameManager {
    constructor() {
        this.game = null;
        this.leaderboardData = [];
    }

    init() {
        console.log('Initializing game manager...');
        this.game = new Game();
        this.game.init();
        this.initializeEventListeners();
        this.initializeLeaderboard();
        console.log('Game manager initialized successfully');
    }

    initializeEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.game.startGame();
            });
        }

        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.game.togglePause();
            });
        }
    }

    initializeLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;

        this.leaderboardData = JSON.parse(localStorage.getItem('leaderboard') || '[]');
        this.updateLeaderboardDisplay();
    }

    updateLeaderboardDisplay() {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;

        leaderboardList.innerHTML = this.leaderboardData
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map((entry, index) => `
                <div class="leaderboard-item">
                    <span class="rank">${index + 1}</span>
                    <span class="name">${entry.name}</span>
                    <span class="score">${entry.score}</span>
                </div>
            `)
            .join('');
    }

    addScoreToLeaderboard(score) {
        const playerName = prompt('恭喜！请输入你的名字：') || '匿名玩家';
        this.leaderboardData.push({
            name: playerName,
            score: score,
            date: new Date().toISOString()
        });

        localStorage.setItem('leaderboard', JSON.stringify(this.leaderboardData));
        this.updateLeaderboardDisplay();
    }
}

window.GameManager = GameManager; 