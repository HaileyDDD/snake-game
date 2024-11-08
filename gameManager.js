class GameManager {
    constructor() {
        this.game = null;
        this.isGameActive = false;
    }

    init() {
        try {
            console.log('Initializing game manager...');
            const styleSheet = document.querySelector('link[rel="stylesheet"]');
            if (styleSheet) {
                styleSheet.href = styleSheet.href.split('?')[0] + '?v=' + new Date().getTime();
            }
            
            this.game = new Game();
            this.game.init();
            this.initializeEventListeners();
            this.loadHighScore();
            console.log('Game manager initialized successfully');
        } catch (error) {
            console.error('Game initialization error:', error);
        }
    }

    initializeEventListeners() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');

        if (startBtn) {
            startBtn.onclick = () => {
                console.log('Start button clicked');
                if (this.game) {
                    this.game.startGame();
                    this.isGameActive = true;
                    document.querySelector('.game-container').classList.add('active');
                }
            };
        } else {
            console.error('Start button not found');
        }

        if (pauseBtn) {
            pauseBtn.onclick = () => {
                console.log('Pause button clicked');
                if (this.game && this.isGameActive) {
                    this.game.togglePause();
                    pauseBtn.textContent = this.game.isPaused ? '继续' : '暂停';
                }
            };
        } else {
            console.error('Pause button not found');
        }

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isGameActive) {
                e.preventDefault();
                if (this.game) {
                    this.game.togglePause();
                    if (pauseBtn) {
                        pauseBtn.textContent = this.game.isPaused ? '继续' : '暂停';
                    }
                }
            }
        });
    }

    loadHighScore() {
        const highScore = localStorage.getItem('highScore') || 0;
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = highScore;
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
    rateGame(type) {
        try {
            const ratings = JSON.parse(localStorage.getItem('gameRatings') || '{"likes": 0, "dislikes": 0}');
            
            if (type === 'like') {
                ratings.likes++;
            } else if (type === 'dislike') {
                ratings.dislikes++;
            }
            
            localStorage.setItem('gameRatings', JSON.stringify(ratings));
            this.updateRatingDisplay();
        } catch (error) {
            console.error('Error rating game:', error);
        }
    }

    // 更新评分显示
    updateRatingDisplay() {
        try {
            const ratings = JSON.parse(localStorage.getItem('gameRatings') || '{"likes": 0, "dislikes": 0}');
            document.getElementById('likeCount').textContent = ratings.likes;
            document.getElementById('dislikeCount').textContent = ratings.dislikes;
        } catch (error) {
            console.error('Error updating ratings:', error);
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

    toggleSound() {
        const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
        localStorage.setItem('soundEnabled', !soundEnabled);
        this.updateSettingsDisplay();
    }

    toggleMusic() {
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        localStorage.setItem('musicEnabled', !musicEnabled);
        this.updateSettingsDisplay();
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }

    changeLanguage(lang) {
        localStorage.setItem('language', lang);
        this.updateLanguageDisplay();
        // 这里可以添加实际的语言切换逻辑
    }

    updateSettingsDisplay() {
        const soundEnabled = localStorage.getItem('soundEnabled') === 'true';
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        
        document.querySelector('[onclick="gameManager.toggleSound()"]').textContent = 
            `声音: ${soundEnabled ? '开' : '关'}`;
        document.querySelector('[onclick="gameManager.toggleMusic()"]').textContent = 
            `音乐: ${musicEnabled ? '开' : '关'}`;
    }

    updateLanguageDisplay() {
        const currentLang = localStorage.getItem('language') || 'zh';
        const langNames = {
            'zh': '中文',
            'en': 'English',
            'ja': '日本語'
        };
        document.querySelector('.language').textContent = langNames[currentLang];
    }

    setupKeyboardControls() {
        // 添加全局键盘事件监听
        window.addEventListener('keydown', (e) => {
            // 游戏进行时阻止方向键的默认行为
            if (this.isGameActive) {
                const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];
                if (arrowKeys.includes(e.key)) {
                    e.preventDefault();
                }
            }
        }, false);

        // 监听游戏状态变化
        document.getElementById('startBtn').addEventListener('click', () => {
            this.isGameActive = true;
        });
    }

    gameOver() {
        this.isGameActive = false;
        document.querySelector('.game-container').classList.remove('active');
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        
        // 只更新最高分，不再要求输入用户名
        const currentHighScore = localStorage.getItem('highScore') || 0;
        if (this.score > currentHighScore) {
            localStorage.setItem('highScore', this.score);
            this.loadHighScore();
        }
        
        this.resetGame();
        document.getElementById('startBtn').textContent = '开始游戏';
    }
}

window.GameManager = GameManager; 