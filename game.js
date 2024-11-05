class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.snake = [];
        this.food = null;
        this.direction = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.isPaused = false;
        this.speed = 120; // 默认速度
        this.obstacles = [];
        this.isPoweredUp = false;
        this.foodEatenCount = 0;
        this.powerUpDuration = 10000; // 变身持续10秒
        this.powerUpTimer = null;
        this.originalSpeed = null;
        this.levelManager = new LevelManager();
    }

    init() {
        console.log('Initializing game...');
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resetGame();
        this.setupEventListeners();
        console.log('Game initialized successfully');
    }

    resetGame() {
        // 初始化蛇的位置
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        this.direction = 'right';
        this.score = 0;
        this.foodEatenCount = 0;
        this.isPoweredUp = false;
        this.spawnFood();
        this.updateScore();
    }

    spawnFood() {
        let x, y;
        do {
            x = Math.floor(Math.random() * (this.canvas.width / 20));
            y = Math.floor(Math.random() * (this.canvas.height / 20));
        } while (this.isCollision(x, y));
        
        this.food = {x, y};
    }

    isCollision(x, y) {
        // 检查是否与蛇身碰撞
        return this.snake.some(segment => segment.x === x && segment.y === y) ||
               // 检查是否与障碍物碰撞
               this.obstacles.some(obs => 
                   x >= obs.x && x < obs.x + obs.width &&
                   y >= obs.y && y < obs.y + obs.height
               );
    }

    handleKeyPress(e) {
        const keys = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        if (keys[e.key] && this.isValidDirection(keys[e.key])) {
            this.direction = keys[e.key];
        }
    }

    isValidDirection(newDirection) {
        if (this.direction === 'up' && newDirection === 'down') return false;
        if (this.direction === 'down' && newDirection === 'up') return false;
        if (this.direction === 'left' && newDirection === 'right') return false;
        if (this.direction === 'right' && newDirection === 'left') return false;
        return true;
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        const highScore = localStorage.getItem('highScore') || 0;
        if (this.score > highScore) {
            localStorage.setItem('highScore', this.score);
            document.getElementById('highScore').textContent = this.score;
        }
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        alert(`游戏结束！得分：${this.score}`);
        this.resetGame();
        document.getElementById('startBtn').textContent = '开始游戏';
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        document.getElementById('pauseBtn').textContent = 
            this.isPaused ? '继续' : '暂停';
    }

    handleFoodCollision() {
        this.score += 10;
        this.foodEatenCount++;
        
        // 播放吃食物音效
        this.playSound('eat');
        
        // 显示得分动画
        this.showScoreAnimation('+10', this.food.x * 20, this.food.y * 20);
        
        // 检查是否达到变身条件
        const currentLevel = this.levelManager.getCurrentLevel();
        if (this.foodEatenCount >= currentLevel.powerUpThreshold && !this.isPoweredUp) {
            this.activatePowerUp();
        }

        this.spawnFood();
        this.updateScore();
    }

    activatePowerUp() {
        this.isPoweredUp = true;
        this.foodEatenCount = 0;
        this.originalSpeed = this.speed;
        this.speed = this.speed * 0.7; // 提升30%速度
        
        // 变身视觉效果
        this.snake.forEach(segment => {
            this.createPowerUpEffect(segment.x * 20, segment.y * 20);
        });
        
        // 显示变身提示
        this.showNotification('无敌模式激活！速度提升30%！', 'power-up');
        
        // 设置变身持续时间
        if (this.powerUpTimer) clearTimeout(this.powerUpTimer);
        this.powerUpTimer = setTimeout(() => this.deactivatePowerUp(), this.powerUpDuration);
    }

    deactivatePowerUp() {
        this.isPoweredUp = false;
        this.speed = this.originalSpeed;
        this.showNotification('无敌模式结束！', 'power-down');
    }

    showScoreAnimation(text, x, y) {
        const scoreText = document.createElement('div');
        scoreText.className = 'score-animation';
        scoreText.textContent = text;
        scoreText.style.left = `${x}px`;
        scoreText.style.top = `${y}px`;
        document.body.appendChild(scoreText);
        
        setTimeout(() => scoreText.remove(), 1000);
    }

    createPowerUpEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'power-up-effect';
        effect.style.left = `${x}px`;
        effect.style.top = `${y}px`;
        document.body.appendChild(effect);
        
        setTimeout(() => effect.remove(), 500);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (this.isPoweredUp) {
                // 变身状态下的发光效果
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#FFD700';
                this.ctx.fillStyle = '#FFD700';
            } else {
                this.ctx.shadowBlur = 0;
                this.ctx.fillStyle = '#00FF00';
            }
            
            this.ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
        });
        
        // 绘制食物和障碍物...
    }
}