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
        this.sounds = null;
        this.isSoundEnabled = false;
        this.powerUpLevels = [
            {
                score: 100,
                name: "黄金蛇",
                color: '#FFD700',
                effect: {
                    speedBoost: 1.3,
                    invincible: true,
                    duration: 8000
                },
                animation: 'golden'
            },
            {
                score: 200,
                name: "彩虹蛇",
                color: 'rainbow',
                effect: {
                    speedBoost: 1.5,
                    invincible: true,
                    duration: 10000,
                    wallPass: true
                },
                animation: 'rainbow'
            },
            {
                score: 300,
                name: "闪电蛇",
                color: '#00ffff',
                effect: {
                    speedBoost: 2.0,
                    invincible: true,
                    duration: 12000,
                    wallPass: true,
                    magneticFood: true
                },
                animation: 'lightning'
            }
        ];
        this.isGameActive = false;
        this.lastUpdateTime = 0;
        this.updateInterval = 1000/60;

        this.difficultyIncrease = {
            speedIncrement: 2,  // 每吃到食物增加的速度
            maxSpeed: 50,       // 最大速度限制
            scoreThreshold: 50  // 每多少分增加一次难度
        };
        
        // 添加游戏统计
        this.stats = {
            totalGames: 0,
            bestScore: 0,
            totalPlayTime: 0,
            startTime: null
        };

        // 添加错误处理
        window.addEventListener('error', (e) => {
            // 忽略第三方脚本错误
            if (e.filename && !e.filename.includes('snake-game')) {
                e.preventDefault();
                return;
            }
            console.error('Game Error:', e.message);
        });

        // 忽略未处理的 Promise 拒绝
        window.addEventListener('unhandledrejection', (e) => {
            if (e.reason && e.reason.toString().includes('Could not establish connection')) {
                e.preventDefault();
                return;
            }
        });

        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenCtx = this.offscreenCanvas.getContext('2d');
        this.frameCount = 0;
    }

    init() {
        console.log('Initializing game...');
        this.checkPermissions();
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found');
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.resetGame();
        this.setupEventListeners();
        this.draw();
        console.log('Game initialized successfully');
    }

    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            // 检查是否是方向键
            const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
            
            // 只有在游戏进行中且按下方向键时才阻止默认行为
            if (this.gameLoop && arrowKeys.includes(e.key)) {
                e.preventDefault(); // 阻止页面滚动
            }
            
            this.handleKeyPress(e);
        });
        
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

        // 添加触摸控制
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!touchStartX || !touchStartY) return;

            const touchEndX = e.touches[0].clientX;
            const touchEndY = e.touches[0].clientY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                this.direction = deltaX > 0 ? 'right' : 'left';
            } else {
                // 垂直滑动
                this.direction = deltaY > 0 ? 'down' : 'up';
            }

            touchStartX = touchEndX;
            touchStartY = touchEndY;
            e.preventDefault();
        }, { passive: false });
    }

    resetGame() {
        // 确保初始位置在画布中心
        const centerX = Math.floor(this.canvas.width / 40);
        const centerY = Math.floor(this.canvas.height / 40);
        
        this.snake = [
            {x: centerX, y: centerY},
            {x: centerX - 1, y: centerY},
            {x: centerX - 2, y: centerY}
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
        // 只有在游戏进行中才处理方向键
        if (!this.gameLoop) return;

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
        console.log('Game Over');
        this.isGameActive = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        // 更新最高分
        const currentHighScore = localStorage.getItem('highScore') || 0;
        if (this.score > currentHighScore) {
            localStorage.setItem('highScore', this.score);
            if (window.gameManager) {
                window.gameManager.loadHighScore();
            }
        }
        
        this.resetGame();
        document.getElementById('startBtn').textContent = '开始游戏';
        this.showGameOverScreen();

        // 更新统计
        if (this.stats.startTime) {
            this.stats.totalPlayTime += (Date.now() - this.stats.startTime) / 1000;
        }
        if (this.score > this.stats.bestScore) {
            this.stats.bestScore = this.score;
        }
        localStorage.setItem('gameStats', JSON.stringify(this.stats));
    }

    togglePause() {
        console.log('Toggling pause state');
        if (!this.isGameActive) return;
        
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isPaused ? '继续' : '暂停';
        }
        
        this.showPauseStatus();
    }

    showPauseStatus() {
        // 创建或更新暂停状态显示
        let pauseStatus = document.getElementById('pauseStatus');
        if (!pauseStatus) {
            pauseStatus = document.createElement('div');
            pauseStatus.id = 'pauseStatus';
            pauseStatus.className = 'pause-status';
            this.canvas.parentNode.appendChild(pauseStatus);
        }
        
        pauseStatus.textContent = this.isPaused ? '游戏已暂停' : '';
        pauseStatus.style.display = this.isPaused ? 'block' : 'none';
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
        this.showCombo();
        this.updateDifficulty();
    }

    activatePowerUp() {
        this.isPoweredUp = true;
        this.foodEatenCount = 0;
        this.originalSpeed = this.speed;

        // 根据分数确定变身等级
        const powerUpLevel = this.getPowerUpLevel();
        
        // 应用变身效果
        this.speed = this.speed * powerUpLevel.effect.speedBoost;
        this.currentPowerUpEffect = powerUpLevel.effect;
        
        // 显示变身动画
        this.showTransformationAnimation(powerUpLevel.animation);
        
        // 显示变身提示
        this.showNotification(
            `${powerUpLevel.name}形态激活！\n速度提升${(powerUpLevel.effect.speedBoost - 1) * 100}%！`, 
            powerUpLevel.animation
        );
        
        // 保存当前游戏状态
        const currentGameState = {
            isGameActive: this.isGameActive,
            isPaused: this.isPaused,
            gameLoop: this.gameLoop
        };
        
        // 设置变身持续时间
        if (this.powerUpTimer) clearTimeout(this.powerUpTimer);
        this.powerUpTimer = setTimeout(() => {
            // 恢复游戏状态
            this.isGameActive = currentGameState.isGameActive;
            this.isPaused = currentGameState.isPaused;
            this.deactivatePowerUp(powerUpLevel);
        }, powerUpLevel.effect.duration);
    }

    getPowerUpLevel() {
        // 从高到低检查分数段
        for (let i = this.powerUpLevels.length - 1; i >= 0; i--) {
            if (this.score >= this.powerUpLevels[i].score) {
                return this.powerUpLevels[i];
            }
        }
        return this.powerUpLevels[0]; // 默认返回第一级变身
    }

    showTransformationAnimation(type) {
        // 创建闪光效果
        const flash = document.createElement('div');
        flash.className = `transformation-flash ${type}`;
        document.body.appendChild(flash);
        
        // 创建变身光环
        this.snake.forEach((segment, index) => {
            setTimeout(() => {
                this.createTransformationRing(segment.x * 20, segment.y * 20, type);
            }, index * 50);
        });
        
        setTimeout(() => flash.remove(), 500);
    }

    createTransformationRing(x, y, type) {
        const ring = document.createElement('div');
        ring.className = `transformation-ring ${type}`;
        ring.style.left = `${x}px`;
        ring.style.top = `${y}px`;
        document.body.appendChild(ring);
        
        setTimeout(() => ring.remove(), 1000);
    }

    deactivatePowerUp(powerUpLevel) {
        // 不要改变游戏状态，只需要复正常速度
        this.isPoweredUp = false;
        this.speed = this.originalSpeed;
        
        // 显示状态变化提示
        this.showNotification('无敌模式结束！', 'power-down');
        
        // 确保游戏继续运行
        if (this.isGameActive) {
            // 如果游戏还在进行中，继续游戏循环
            if (!this.gameLoop) {
                this.startGameLoop();
            }
        }
    }

    startGameLoop() {
        const gameLoop = (timestamp) => {
            if (!this.lastUpdateTime) this.lastUpdateTime = timestamp;
            
            const deltaTime = timestamp - this.lastUpdateTime;
            
            if (deltaTime >= this.speed) {
                if (!this.isPaused && this.isGameActive) {
                    this.update();
                    this.draw();
                    this.lastUpdateTime = timestamp;
                }
            }
            
            if (this.isGameActive) {
                this.gameLoop = requestAnimationFrame(gameLoop);
            }
        };
        
        this.gameLoop = requestAnimationFrame(gameLoop);
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

    draw() {
        // 使用离屏渲染
        this.offscreenCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 只在需要时重绘背景网格
        if (this.frameCount % 30 === 0) {
            this.drawGrid(this.offscreenCtx);
        }
        
        // 绘制游戏元素
        this.drawSnake(this.offscreenCtx);
        this.drawFood(this.offscreenCtx);
        
        // 复制到主画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.offscreenCanvas, 0, 0);
        
        this.frameCount++;
    }

    // 使用 requestAnimationFrame 的平滑动画
    animate() {
        if (!this.isPaused && this.isGameActive) {
            const now = performance.now();
            const delta = now - this.lastUpdateTime;

            if (delta >= this.speed) {
                this.update();
                this.draw();
                this.lastUpdateTime = now;
            }

            requestAnimationFrame(() => this.animate());
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
        
        // 添加发光效果
        if (this.isPoweredUp) {
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#FFD700';
        }
        
        // 蛇头渐变
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
        
        // 绘制蛇头
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 10, 9, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 眼睛和舌头
        this.drawSnakeEyes(x, y);
        this.drawSnakeTongue(x, y);
        
        this.ctx.shadowBlur = 0;
    }

    drawSnakeEyes(x, y) {
        // 眼睛白色部分
        this.ctx.fillStyle = 'white';
        const eyePositions = this.getEyePositions(x, y);
        eyePositions.forEach(pos => {
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 球
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(pos.x + pos.pupilOffset.x, pos.y + pos.pupilOffset.y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    getEyePositions(x, y) {
        const positions = {
            'right': [
                { x: x + 14, y: y + 7, pupilOffset: { x: 1, y: 0 } },
                { x: x + 14, y: y + 13, pupilOffset: { x: 1, y: 0 } }
            ],
            'left': [
                { x: x + 6, y: y + 7, pupilOffset: { x: -1, y: 0 } },
                { x: x + 6, y: y + 13, pupilOffset: { x: -1, y: 0 } }
            ],
            'up': [
                { x: x + 7, y: y + 6, pupilOffset: { x: 0, y: -1 } },
                { x: x + 13, y: y + 6, pupilOffset: { x: 0, y: -1 } }
            ],
            'down': [
                { x: x + 7, y: y + 14, pupilOffset: { x: 0, y: 1 } },
                { x: x + 13, y: y + 14, pupilOffset: { x: 0, y: 1 } }
            ]
        };
        return positions[this.direction];
    }

    drawSnakeTongue(x, y) {
        this.ctx.strokeStyle = '#ff0066';
        this.ctx.lineWidth = 1;
        
        const tongueStart = this.getTongueStart(x, y);
        const tongueLength = 6;
        const forkLength = 3;
        
        this.ctx.beginPath();
        this.ctx.moveTo(tongueStart.x, tongueStart.y);
        this.ctx.lineTo(tongueStart.x + tongueLength * tongueStart.dirX, 
                        tongueStart.y + tongueLength * tongueStart.dirY);
                        
        // 分叉
        const forkX = tongueStart.x + tongueLength * tongueStart.dirX;
        const forkY = tongueStart.y + tongueLength * tongueStart.dirY;
        
        this.ctx.moveTo(forkX, forkY);
        this.ctx.lineTo(forkX + forkLength * (tongueStart.dirX + 0.5), 
                        forkY + forkLength * (tongueStart.dirY + 0.5));
        this.ctx.moveTo(forkX, forkY);
        this.ctx.lineTo(forkX + forkLength * (tongueStart.dirX - 0.5), 
                        forkY + forkLength * (tongueStart.dirY - 0.5));
        
        this.ctx.stroke();
    }

    getTongueStart(x, y) {
        const positions = {
            'right': { x: x + 18, y: y + 10, dirX: 1, dirY: 0 },
            'left': { x: x + 2, y: y + 10, dirX: -1, dirY: 0 },
            'up': { x: x + 10, y: y + 2, dirX: 0, dirY: -1 },
            'down': { x: x + 10, y: y + 18, dirX: 0, dirY: 1 }
        };
        return positions[this.direction];
    }

    drawSnakeBody(segment, index) {
        const x = segment.x * 20;
        const y = segment.y * 20;
        
        if (this.isPoweredUp) {
            const powerUpLevel = this.getPowerUpLevel();
            
            if (powerUpLevel.color === 'rainbow') {
                // 彩虹效果
                const hue = (Date.now() / 10 + index * 10) % 360;
                this.ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            } else {
                // 其他变身效果
                this.ctx.fillStyle = powerUpLevel.color;
            }
            
            // 特殊效果
            switch (powerUpLevel.animation) {
                case 'lightning':
                    this.drawLightningEffect(x, y);
                    break;
                case 'rainbow':
                    this.drawRainbowTrail(x, y);
                    break;
                case 'golden':
                    this.drawGoldenSparkles(x, y);
                    break;
            }
        } else {
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
        
        // 更新头部位置
        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // 检查边界碰撞
        const hitBoundary = this.checkBoundaryCollision(head);
        if (hitBoundary) {
            if (this.isPoweredUp) {
                // 变身状态下穿墙
                if (head.x < 0) head.x = Math.floor(this.canvas.width / 20) - 1;
                if (head.x >= this.canvas.width / 20) head.x = 0;
                if (head.y < 0) head.y = Math.floor(this.canvas.height / 20) - 1;
                if (head.y >= this.canvas.height / 20) head.y = 0;
            } else {
                // 非变身状态下碰到边界直接结束游戏
                this.gameOver();
                return;
            }
        }

        // 检查其他碰撞（自身和障碍物）
        if (!this.isPoweredUp && this.checkOtherCollisions(head)) {
            this.gameOver();
            return;
        }

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.handleFoodCollision();
        } else {
            this.snake.pop();
        }

        // 只有在确保位置有效后才更新蛇的位置
        this.snake.unshift(head);
    }

    checkBoundaryCollision(head) {
        return head.x < 0 || 
               head.x >= Math.floor(this.canvas.width / 20) || 
               head.y < 0 || 
               head.y >= Math.floor(this.canvas.height / 20);
    }

    checkOtherCollisions(head) {
        // 检查自身碰撞
        const selfCollision = this.snake.some(segment => 
            segment.x === head.x && segment.y === head.y
        );

        // 检查障碍物碰撞
        const obstacleCollision = this.obstacles.some(obs => 
            head.x >= obs.x && head.x < obs.x + obs.width &&
            head.y >= obs.y && head.y < obs.y + obs.height
        );

        return selfCollision || obstacleCollision;
    }

    startGame() {
        console.log('Starting game...');
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.resetGame();
        this.isPaused = false;
        this.isGameActive = true;
        
        // 使用 requestAnimationFrame 替代 setInterval
        const gameLoop = (timestamp) => {
            if (!this.lastUpdateTime) this.lastUpdateTime = timestamp;
            
            const deltaTime = timestamp - this.lastUpdateTime;
            
            if (deltaTime >= this.speed) {
                if (!this.isPaused && this.isGameActive) {
                    this.update();
                    this.draw();
                    this.lastUpdateTime = timestamp;
                }
            }
            
            if (this.isGameActive) {
                this.gameLoop = requestAnimationFrame(gameLoop);
            }
        };
        
        this.gameLoop = requestAnimationFrame(gameLoop);
        document.getElementById('startBtn').textContent = '重新开始';
        console.log('Game started successfully');

        this.stats.startTime = Date.now();
        this.stats.totalGames++;
        localStorage.setItem('gameStats', JSON.stringify(this.stats));
    }

    playSound(soundName) {
        // 暂时禁用音效
        return;
        
        /* 当有音效文件时可以启用这段代码
        if (this.isSoundEnabled && this.sounds && this.sounds[soundName]) {
            this.sounds[soundName].currentTime = 0;
            this.sounds[soundName].play().catch(e => console.log('Sound play failed:', e));
        }
        */
    }

    showScoreAnimation(score, x, y) {
        const scoreText = document.createElement('div');
        scoreText.className = 'score-popup';
        scoreText.textContent = `+${score}`;
        scoreText.style.left = `${x}px`;
        scoreText.style.top = `${y}px`;
        document.body.appendChild(scoreText);
        
        setTimeout(() => scoreText.remove(), 1000);
    }

    showPowerUpAnimation() {
        const flash = document.createElement('div');
        flash.className = 'power-up-flash';
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 500);
    }

    showNotification(message, type) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `game-notification ${type}`;
        notification.textContent = message;
        
        // 设置样式
        notification.style.position = 'fixed';
        notification.style.top = '50%';
        notification.style.left = '50%';
        notification.style.transform = 'translate(-50%, -50%)';
        notification.style.background = type === 'power-up' ? 
            'rgba(255, 215, 0, 0.9)' : 'rgba(255, 69, 0, 0.9)';
        notification.style.color = 'white';
        notification.style.padding = '15px 30px';
        notification.style.borderRadius = '10px';
        notification.style.fontSize = '20px';
        notification.style.fontWeight = 'bold';
        notification.style.zIndex = '1000';
        notification.style.animation = 'fadeInOut 2s ease-in-out forwards';
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 设置自动移除
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }

    // 特殊效果绘制方法
    drawLightningEffect(x, y) {
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#00ffff';
        // 添加闪电效果
    }

    drawRainbowTrail(x, y) {
        // 添加彩虹拖尾效果
    }

    drawGoldenSparkles(x, y) {
        // 添加金色粒子效果
    }

    showGameOverScreen() {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over-screen';
        gameOverScreen.innerHTML = `
            <div class="game-over-content">
                <h2>游戏结束</h2>
                <p>得分: ${this.score}</p>
                <button onclick="window.gameManager.game.startGame()">重新开始</button>
            </div>
        `;
        
        document.body.appendChild(gameOverScreen);
        
        setTimeout(() => {
            gameOverScreen.remove();
        }, 2000);
    }

    cleanup() {
        // 清理游戏资源
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        this.isGameActive = false;
        this.isPaused = false;
    }

    checkPermissions() {
        // 检查并请求必要的权限
        if ('permissions' in navigator) {
            Promise.all([
                navigator.permissions.query({ name: 'accelerometer' }),
                navigator.permissions.query({ name: 'gyroscope' })
            ]).catch(() => {
                // 忽略权限错误
                console.log('Permissions not available');
            });
        }
    }

    // 动态难度调整
    updateDifficulty() {
        if (this.score > 0 && this.score % this.difficultyIncrease.scoreThreshold === 0) {
            const newSpeed = Math.max(
                this.speed - this.difficultyIncrease.speedIncrement,
                this.difficultyIncrease.maxSpeed
            );
            if (newSpeed !== this.speed) {
                this.speed = newSpeed;
                this.showNotification('速度提升！', 'speed-up');
            }
        }
    }

    showCombo() {
        let combo = 0;
        const now = Date.now();
        const comboTimeWindow = 2000; // 2秒内的连续得分算作连击

        if (this.lastScoreTime && (now - this.lastScoreTime) < comboTimeWindow) {
            combo = (this.comboCount || 0) + 1;
            this.comboCount = combo;
            
            if (combo > 2) {
                this.showNotification(`${combo}连击！`, 'combo');
                // 连击加分
                this.score += combo * 2;
            }
        } else {
            this.comboCount = 0;
        }
        
        this.lastScoreTime = now;
    }
}

// 添加页面卸载时的清理
window.addEventListener('beforeunload', () => {
    if (window.gameManager && window.gameManager.game) {
        window.gameManager.game.cleanup();
    }
});

// 确保在全局范围内可访问
window.Game = Game;