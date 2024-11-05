class Game {
    constructor() {
        this.levelManager = new LevelManager();
        this.isPoweredUp = false;
        this.foodEatenCount = 0;
        this.powerUpDuration = 10000; // 10秒变身时间
        this.powerUpTimer = null;
        this.snake = null;
        this.canvas = null;
        this.ctx = null;
    }

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.loadLevel(this.levelManager.getCurrentLevel());
        this.setupEventListeners();
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

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制蛇
        if (this.isPoweredUp) {
            // 绘制发光效果
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#FFD700';
        } else {
            this.ctx.shadowBlur = 0;
        }
        
        // 绘制其他游戏元素...
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