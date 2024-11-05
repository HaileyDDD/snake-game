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
        this.levelManager = new LevelManager();
        this.isPoweredUp = false;
        this.foodEatenCount = 0;
        this.powerUpDuration = 10000;
        this.powerUpTimer = null;
    }

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 初始化蛇的位置
        this.snake = [
            {x: 10, y: 10},
            {x: 9, y: 10},
            {x: 8, y: 10}
        ];
        
        // 生成第一个食物
        this.spawnFood();
        
        // 设置事件监听
        this.setupEventListeners();
        
        // 加载第一关
        this.loadLevel(this.levelManager.getCurrentLevel());
        
        console.log('Game initialized successfully');
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    }

    startGame() {
        if (this.gameLoop) return;
        
        this.isPaused = false;
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.speed);
        
        document.getElementById('startBtn').textContent = '重新开始';
    }

    update() {
        if (this.isPaused) return;

        // 移动蛇
        const head = {x: this.snake[0].x, y: this.snake[0].y};
        
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

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = this.isPoweredUp ? '#FFD700' : '#00FF00';
            if (this.isPoweredUp) {
                this.ctx.shadowBlur = 20;
                this.ctx.shadowColor = '#FFD700';
            }
            this.ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
            this.ctx.shadowBlur = 0;
        });

        // 绘制食物
        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(this.food.x * 20, this.food.y * 20, 18, 18);

        // 绘制障碍物
        if (this.obstacles) {
            this.ctx.fillStyle = '#666666';
            this.obstacles.forEach(obstacle => {
                this.ctx.fillRect(obstacle.x * 20, obstacle.y * 20, 
                                obstacle.width * 20, obstacle.height * 20);
            });
        }
    }

    loadLevel(levelConfig) {
        this.speed = levelConfig.speed;
        this.targetScore = levelConfig.target;
        this.obstacles = levelConfig.obstacles;
        
        // 更新UI显示
        document.getElementById('level').textContent = levelConfig.id;
        document.getElementById('levelGoal').textContent = 
            `目标分数: ${levelConfig.target}\n${levelConfig.description}`;
        
        // 重置蛇的位置和食物
        this.resetGame();
        this.spawnFood(levelConfig.foodCount);
    }

    checkLevelComplete() {
        if (this.score >= this.targetScore) {
            const nextLevel = this.levelManager.nextLevel();
            if (nextLevel) {
                alert(`恭喜！完成第${this.levelManager.currentLevel - 1}关！\n准备进入第${nextLevel.id}关`);
                this.loadLevel(nextLevel);
            } else {
                alert('恭喜！你已经完成了所有关卡！');
                this.resetGame();
            }
        }
    }

    // 在游戏循环中添加检查
    gameLoop() {
        this.checkLevelComplete();
    }

    handleFoodCollision() {
        this.score += 10;
        this.foodEatenCount++;
        
        // 播放音效
        this.playSound('eat');
        
        const currentLevel = this.levelManager.getCurrentLevel();
        if (this.foodEatenCount >= currentLevel.powerUpThreshold && !this.isPoweredUp) {
            this.activatePowerUp();
        }

        this.spawnFood(1);
        this.updateScore();
    }

    activatePowerUp() {
        this.isPoweredUp = true;
        this.foodEatenCount = 0;
        
        // 播放变身音效
        this.playSound('powerup');
        
        // 变身效果：加速并无敌
        const originalSpeed = this.speed;
        this.speed = this.speed * 0.8; // 提升20%速度
        
        // 添加视觉效果
        this.snake.style = {
            color: '#FFD700',
            glowEffect: true,
            size: 1.2 // 蛇身变大
        };
        
        this.showNotification('无敌模式激活！速度提升20%！', 'power-up');

        if (this.powerUpTimer) clearTimeout(this.powerUpTimer);
        this.powerUpTimer = setTimeout(() => {
            this.endPowerUp(originalSpeed);
        }, this.powerUpDuration);
    }

    endPowerUp(originalSpeed) {
        this.isPoweredUp = false;
        this.speed = originalSpeed;
        
        // 恢复正常视觉效果
        this.snake.style = {
            color: '#00ff00',
            glowEffect: false,
            size: 1
        };
        
        this.playSound('powerdown');
        this.showNotification('无敌模式结束！', 'power-down');
    }

    playSound(type) {
        // 添加音效播放逻辑
        const sounds = {
            eat: 'path/to/eat-sound.mp3',
            powerup: 'path/to/powerup-sound.mp3',
            powerdown: 'path/to/powerdown-sound.mp3'
        };
        // TODO: 实现音效播放
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    checkCollision() {
        if (this.isPoweredUp) return false; // 变身状态下无敌
        // ... 原有的碰撞检测逻辑 ...
    }
}