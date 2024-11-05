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
        this.speed = 120;
        this.obstacles = [];
        this.isPoweredUp = false;
        this.foodEatenCount = 0;
        this.powerUpDuration = 10000;
        this.powerUpTimer = null;
        this.originalSpeed = null;
        this.levelManager = new LevelManager();
    }

    init() {
        console.log('Initializing game...');
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.resetGame();
        this.setupEventListeners();
        console.log('Game initialized successfully');
    }

    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        
        // 游戏控制按钮
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const speedSlider = document.getElementById('speedSlider');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (!this.gameLoop) {
                    this.startGame();
                } else {
                    this.resetGame();
                    this.startGame();
                }
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.togglePause());
        }
        
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.speed = 200 - (e.target.value * 15);
            });
        }
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
        
        // 添加到排行榜
        if (window.gameManager) {
            window.gameManager.addScoreToLeaderboard(this.score);
        }
        
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
        
        // 绘制网格背景
        this.drawGrid();
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.drawSnakeHead(segment);
            } else {
                // 蛇身
                this.drawSnakeBody(segment, index);
            }
        });
        
        // 绘制食物
        this.drawFood();
        
        // 绘制特效
        if (this.isPoweredUp) {
            this.drawPowerUpEffect();
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.canvas.width; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= this.canvas.height; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvas.width, i);
            this.ctx.stroke();
        }
    }

    drawSnakeHead(head) {
        const x = head.x * 20;
        const y = head.y * 20;
        
        // 基础头部
        this.ctx.fillStyle = this.isPoweredUp ? '#FFD700' : '#4CAF50';
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 10, 9, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 眼睛
        this.ctx.fillStyle = 'white';
        switch(this.direction) {
            case 'right':
                this.ctx.fillRect(x + 12, y + 6, 4, 4);
                this.ctx.fillRect(x + 12, y + 12, 4, 4);
                break;
            case 'left':
                this.ctx.fillRect(x + 4, y + 6, 4, 4);
                this.ctx.fillRect(x + 4, y + 12, 4, 4);
                break;
            case 'up':
                this.ctx.fillRect(x + 6, y + 4, 4, 4);
                this.ctx.fillRect(x + 12, y + 4, 4, 4);
                break;
            case 'down':
                this.ctx.fillRect(x + 6, y + 12, 4, 4);
                this.ctx.fillRect(x + 12, y + 12, 4, 4);
                break;
        }
    }

    drawSnakeBody(segment, index) {
        const x = segment.x * 20;
        const y = segment.y * 20;
        
        // 渐变色蛇身
        const gradient = this.ctx.createRadialGradient(
            x + 10, y + 10, 0,
            x + 10, y + 10, 10
        );
        
        if (this.isPoweredUp) {
            gradient.addColorStop(0, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
        } else {
            gradient.addColorStop(0, '#4CAF50');
            gradient.addColorStop(1, '#388E3C');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 10, 8, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawFood() {
        const x = this.food.x * 20;
        const y = this.food.y * 20;
        
        // 苹果形状
        this.ctx.fillStyle = '#ff0000';
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 12, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 苹果茎
        this.ctx.fillStyle = '#795548';
        this.ctx.fillRect(x + 9, y + 4, 2, 4);
        
        // 叶子
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 12, y + 5, 4, 2, Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawPowerUpEffect() {
        // 发光效果
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#FFD700';
        
        // 粒子效果
        this.snake.forEach(segment => {
            const x = segment.x * 20;
            const y = segment.y * 20;
            
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 10;
                
                this.ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
                this.ctx.beginPath();
                this.ctx.arc(
                    x + 10 + Math.cos(angle) * radius,
                    y + 10 + Math.sin(angle) * radius,
                    2,
                    0,
                    Math.PI * 2
                );
                this.ctx.fill();
            }
        });
        
        this.ctx.shadowBlur = 0;
    }

    loadLevel(levelConfig) {
        if (!levelConfig) return;
        
        this.speed = levelConfig.speed;
        this.obstacles = levelConfig.obstacles || [];
        document.getElementById('level').textContent = levelConfig.id;
        document.getElementById('levelGoal').textContent = 
            `目标分数: ${levelConfig.target}\n${levelConfig.description}`;
        
        this.resetGame();
    }

    update() {
        if (this.isPaused) return;

        const head = {...this.snake[0]};
        
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检查碰撞
        if (!this.isPoweredUp && this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.handleFoodCollision();
        } else {
            this.snake.pop();
        }

        this.snake.unshift(head);
    }

    checkCollision(head) {
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.canvas.width / 20 ||
            head.y < 0 || head.y >= this.canvas.height / 20) {
            return true;
        }

        // 检查自身碰撞
        return this.snake.some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    startGame() {
        if (this.gameLoop) return;
        
        this.isPaused = false;
        this.gameLoop = setInterval(() => {
            if (!this.isPaused) {
                this.update();
                this.draw();
            }
        }, this.speed);
        
        document.getElementById('startBtn').textContent = '重新开始';
    }
}

// 确保在全局范围内可访问
window.Game = Game;