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
        this.loadHighScore();
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

    loadHighScore() {
        const highScore = localStorage.getItem('highScore') || 0;
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = highScore;
        }
    }

    initializeLeaderboard() {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;

        try {
            this.leaderboardData = JSON.parse(localStorage.getItem('leaderboard') || '[]');
            this.updateLeaderboardDisplay();
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.leaderboardData = [];
        }
    }

    updateLeaderboardDisplay() {
        const leaderboardList = document.getElementById('leaderboardList');
        if (!leaderboardList) return;

        const topScores = this.leaderboardData
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        leaderboardList.innerHTML = topScores
            .map((entry, index) => `
                <div class="leaderboard-item">
                    <span class="rank">${index + 1}</span>
                    <span class="name">${this.escapeHtml(entry.name)}</span>
                    <span class="score">${entry.score}</span>
                </div>
            `)
            .join('');
    }

    addScoreToLeaderboard(score) {
        if (!score) return;

        try {
            const playerName = prompt('恭喜！请输入你的名字：') || '匿名玩家';

            this.leaderboardData.push({
                name: playerName,
                score: score,
                date: new Date().toISOString()
            });

            localStorage.setItem('leaderboard', JSON.stringify(this.leaderboardData));

            this.updateLeaderboardDisplay();

            const currentHighScore = localStorage.getItem('highScore') || 0;
            if (score > currentHighScore) {
                localStorage.setItem('highScore', score);
                this.loadHighScore();
            }
        } catch (error) {
            console.error('Error adding score to leaderboard:', error);
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

window.GameManager = GameManager; 