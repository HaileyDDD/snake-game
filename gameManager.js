class GameManager {
    constructor() {
        this.game = null;
        this.leaderboardData = [];
    }

    init() {
        console.log('Initializing game manager...');
        try {
            this.game = new Game();
            this.game.init();
            this.initializeEventListeners();
            this.initializeLeaderboard();
            this.loadHighScore();
            console.log('Game manager initialized successfully');
        } catch (error) {
            console.error('Error during initialization:', error);
        }
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

    // 添加评分功能
    rateGame(stars) {
        try {
            const ratings = JSON.parse(localStorage.getItem('gameRatings') || '[]');
            ratings.push({
                stars: stars,
                date: new Date().toISOString()
            });
            localStorage.setItem('gameRatings', JSON.stringify(ratings));
            this.updateRatingDisplay();
        } catch (error) {
            console.error('Error rating game:', error);
        }
    }

    // 更新评分显示
    updateRatingDisplay() {
        const ratings = JSON.parse(localStorage.getItem('gameRatings') || '[]');
        if (ratings.length === 0) return;
        
        const avgRating = ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length;
        const starsElement = document.querySelector('.stars');
        if (starsElement) {
            starsElement.textContent = '★'.repeat(Math.round(avgRating)) + 
                                     '☆'.repeat(5 - Math.round(avgRating));
            document.querySelector('.rating-section p').textContent = 
                `${avgRating.toFixed(1)} / 5 (基于${ratings.length}个评价)`;
        }
    }

    // 分享功能
    shareGame(platform) {
        const shareText = `我在超级贪吃蛇中获得了${this.game.score}分！来挑战我吧！`;
        const shareUrl = window.location.href;
        
        const shareLinks = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
        };
        
        if (shareLinks[platform]) {
            window.open(shareLinks[platform], '_blank');
        }
    }
}

window.GameManager = GameManager; 