class SnakeGame {
    constructor(levelData) {
        console.log('Initializing SnakeGame with level data:', levelData);
        
        // 检查 ThemeManager 是否可用
        if (typeof ThemeManager === 'undefined') {
            throw new Error('ThemeManager is required but not loaded');
        }

        // 保存关卡数据
        this.levelData = levelData || {
            name: "默认关卡",
            description: "基础关卡",
            target: 50,
            obstacles: [],
            specialFeatures: {
                foodValue: 10
            }
        };

        this.config = {
            canvas: document.getElementById('gameCanvas'),
            startBtn: document.getElementById('startBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            difficultySelect: document.getElementById('difficulty'),
            speedSlider: document.getElementById('speedSlider'),
            gridSize: 20,
            gridCount: 20,
            initialSpeed: 200
        };

        if (!this.config.canvas) {
            throw new Error('Canvas element not found');
        }

        // 初始化游戏状态
        this.gameState = {
            ctx: this.config.canvas.getContext('2d'),
            snake: [{x: 5, y: 5}],
            food: null,
            dx: 1,
            dy: 0,
            score: 0,
            level: levelData ? levelData.level : 1,
            speed: this.config.initialSpeed,
            isPaused: true,
            gameLoop: null,
            lastRender: 0,
            gameOver: false,
            obstacles: levelData ? levelData.obstacles : [],
            startTime: null,
            skills: {
                slowTime: { active: false, cooldown: false },
                shield: { active: false, cooldown: false },
                magnet: { active: false, cooldown: false }
            }
        };

        try {
            // 创建主题管理器实例
            this.themeManager = new ThemeManager();
            
            // 获取当前关卡的主题
            this.currentTheme = this.themeManager.getTheme(levelData.level);
            
            // 获取蛇的外观
            this.snakeTheme = this.themeManager.getSnakeTheme();
        } catch (error) {
            console.error('Error initializing theme:', error);
            // 使用默认主题作为后备
            this.loadDefaultTheme();
        }

        // 加载主题
        this.loadTheme();
        
        // 初始化游戏
        this.init();
        
        // 绑定事件
        this.bindEvents();

        console.log('SnakeGame initialized successfully');

        // 添加难度配置
        this.difficultySettings = {
            easy: {
                speed: 200,         // 较慢的速度
                foodValue: 10,      // 普通分数
                wallPass: true,     // 可以穿墙
                specialFoodChance: 0.1,  // 10%几率出现特殊食物
                obstacleSpeed: 1    // 障碍物移动慢
            },
            normal: {
                speed: 150,         // 中等速度
                foodValue: 15,      // 稍高分数
                wallPass: false,    // 不能穿墙
                specialFoodChance: 0.15, // 15%几率出现特殊食物
                obstacleSpeed: 1.5  // 障碍物移动适中
            },
            hard: {
                speed: 100,         // 较快速度
                foodValue: 20,      // 高分数
                wallPass: false,    // 不能穿墙
                specialFoodChance: 0.2,  // 20%几率出现特殊食物
                obstacleSpeed: 2,   // 障碍物移动快
                movingObstacles: true    // 添加移动障碍物
            },
            expert: {
                speed: 80,          // 非常快
                foodValue: 25,      // 最高分数
                wallPass: false,    // 不能穿墙
                specialFoodChance: 0.25, // 25%几率出现特殊食物
                obstacleSpeed: 2.5, // 障碍物移动非常快
                movingObstacles: true,   // 添加移动障碍物
                shrinkingSpace: true,    // 可用空间会逐渐缩小
                foodDisappears: true     // 食物会消失
            }
        };

        // 获取当前难度设置
        const difficulty = this.config.difficultySelect.value;
        const difficultyConfig = this.difficultySettings[difficulty];

        // 应用难度设置
        this.gameState.speed = difficultyConfig.speed;
        this.gameState.wallPass = difficultyConfig.wallPass;
        this.levelData.specialFeatures = {
            ...this.levelData.specialFeatures,
            ...difficultyConfig
        };

        // 添加难度相关的监听器
        this.config.difficultySelect.addEventListener('change', () => {
            const newDifficulty = this.config.difficultySelect.value;
            const newConfig = this.difficultySettings[newDifficulty];
            this.gameState.speed = newConfig.speed;
            this.gameState.wallPass = newConfig.wallPass;
            this.levelData.specialFeatures = {
                ...this.levelData.specialFeatures,
                ...newConfig
            };
        });
    }

    init() {
        // 生成初始食物
        this.generateFood();
        // 初始绘制
        this.draw();
    }

    loadTheme() {
        // 初始化主题
        this.currentTheme = {
            background: '#000000',
            snake: {
                head: '#32CD32',
                body: '#228B22'
            },
            food: '#FF0000',
            obstacles: '#808080',
            gridLines: '#1a1a1a'
        };
    }

    bindEvents() {
        // 键盘控制
        document.addEventListener('keydown', (event) => {
            if (this.gameState.gameOver) return;
            if (this.gameState.isPaused && event.key !== ' ') return;

            switch(event.key) {
                case 'ArrowUp':
                    if (this.gameState.dy !== 1) {
                        this.gameState.dx = 0;
                        this.gameState.dy = -1;
                    }
                    event.preventDefault();
                    break;
                case 'ArrowDown':
                    if (this.gameState.dy !== -1) {
                        this.gameState.dx = 0;
                        this.gameState.dy = 1;
                    }
                    event.preventDefault();
                    break;
                case 'ArrowLeft':
                    if (this.gameState.dx !== 1) {
                        this.gameState.dx = -1;
                        this.gameState.dy = 0;
                    }
                    event.preventDefault();
                    break;
                case 'ArrowRight':
                    if (this.gameState.dx !== -1) {
                        this.gameState.dx = 1;
                        this.gameState.dy = 0;
                    }
                    event.preventDefault();
                    break;
                case ' ':
                    this.togglePause();
                    event.preventDefault();
                    break;
            }
        });

        // 开始按钮
        this.config.startBtn.addEventListener('click', () => {
            this.start();
        });

        // 暂停按钮
        this.config.pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });
    }

    start() {
        console.log('Starting game...');
        this.resetGame();
        this.gameState.isPaused = false;
        this.gameState.startTime = Date.now();
        this.gameLoop();
        console.log('Game loop started');
    }

    togglePause() {
        this.gameState.isPaused = !this.gameState.isPaused;
        this.config.pauseBtn.textContent = this.gameState.isPaused ? '继续' : '暂停';
    }

    gameLoop() {
        if (this.gameState.gameOver || this.gameState.isPaused) {
            console.log('Game loop stopped:', 
                this.gameState.gameOver ? 'Game Over' : 'Paused');
            return;
        }

        // 使用 requestAnimationFrame 的时间戳来控制更新频率
        const now = performance.now();
        const elapsed = now - this.gameState.lastRender;

        // 根据难度调整更新频率
        const difficulty = this.config.difficultySelect.value;
        const updateInterval = this.getDifficultyInterval(difficulty);

        if (elapsed >= updateInterval) {
            this.update();
            this.gameState.lastRender = now;
        }

        // 始终进行绘制，保持画面流畅
        this.draw();

        // 请求下一帧
        this.gameState.gameLoop = requestAnimationFrame(() => this.gameLoop());
    }

    // 添加难度更新间隔获取方法
    getDifficultyInterval(difficulty) {
        const intervals = {
            easy: 200,      // 5 FPS
            normal: 150,    // 约6.7 FPS
            hard: 100,      // 10 FPS
            expert: 80      // 约12.5 FPS
        };
        return intervals[difficulty] || 150;
    }

    update() {
        const difficulty = this.config.difficultySelect.value;
        const difficultyConfig = this.difficultySettings[difficulty];

        // 更新移动障碍物位置（使用时间插值）
        if (difficultyConfig.movingObstacles) {
            const now = performance.now();
            const deltaTime = (now - this.gameState.lastRender) / 1000;
            this.updateMovingObstacles(difficultyConfig.obstacleSpeed, deltaTime);
        }

        // 处理专家模式的特殊效果
        if (difficulty === 'expert') {
            // 缩小可用空间
            if (difficultyConfig.shrinkingSpace && this.gameState.score > 0 && this.gameState.score % 50 === 0) {
                this.addBoundaryObstacles();
            }

            // 食物消失机制
            if (difficultyConfig.foodDisappears && this.gameState.food.timeLeft === undefined) {
                this.gameState.food.timeLeft = 100; // 食物存在的帧数
            }
            if (this.gameState.food.timeLeft !== undefined) {
                this.gameState.food.timeLeft--;
                if (this.gameState.food.timeLeft <= 0) {
                    this.generateFood();
                }
            }
        }

        const head = {
            x: this.gameState.snake[0].x + this.gameState.dx,
            y: this.gameState.snake[0].y + this.gameState.dy
        };

        // 处理穿墙
        if (this.levelData.specialFeatures.wallPass) {
            head.x = (head.x + this.config.gridCount) % this.config.gridCount;
            head.y = (head.y + this.config.gridCount) % this.config.gridCount;
        } else if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        // 检查是否吃到食物
        if (head.x === this.gameState.food.x && head.y === this.gameState.food.y) {
            this.gameState.score += this.levelData.specialFeatures.foodValue;
            document.getElementById('score').textContent = this.gameState.score;
            this.generateFood();
        } else {
            this.gameState.snake.pop();
        }

        this.gameState.snake.unshift(head);
        this.checkGameStatus();
    }

    checkCollision(head) {
        // 检查是否撞墙
        if (!this.levelData.specialFeatures.wallPass) {
            if (head.x < 0 || head.x >= this.config.gridCount || 
                head.y < 0 || head.y >= this.config.gridCount) {
                return true;
            }
        }

        // 检查是否撞到自己
        return this.gameState.snake.some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.config.gridCount),
                y: Math.floor(Math.random() * this.config.gridCount)
            };
        } while (
            this.gameState.snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            )
        );
        this.gameState.food = newFood;
    }

    draw() {
        const { ctx } = this.gameState;
        
        // 清除整个画布
        ctx.clearRect(0, 0, this.config.canvas.width, this.config.canvas.height);
        
        // 绘制背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);

        // 使用离屏canvas绘制网格
        if (!this.gridCanvas) {
            this.gridCanvas = this.createGridCanvas();
        }
        ctx.drawImage(this.gridCanvas, 0, 0);

        // 绘制食物
        this.drawFood();

        // 绘制蛇
        this.drawSnake();

        // 绘制特效
        this.drawEffects();

        // 在专家模式下绘制食物倒计时
        if (this.config.difficultySelect.value === 'expert' && 
            this.gameState.food.timeLeft !== undefined) {
            this.drawFoodTimer();
        }
    }

    // 创建网格缓存画布
    createGridCanvas() {
        const canvas = document.createElement('canvas');
        canvas.width = this.config.canvas.width;
        canvas.height = this.config.canvas.height;
        const ctx = canvas.getContext('2d');

        ctx.strokeStyle = this.currentTheme.gridLines;
        ctx.lineWidth = 0.5;

        for (let i = 0; i <= this.config.gridCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * this.config.gridSize, 0);
            ctx.lineTo(i * this.config.gridSize, canvas.height);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i * this.config.gridSize);
            ctx.lineTo(canvas.width, i * this.config.gridSize);
            ctx.stroke();
        }

        return canvas;
    }

    // 优化蛇的绘制
    drawSnake() {
        const { ctx } = this.gameState;
        
        // 使用路径批量绘制蛇身
        ctx.beginPath();
        this.gameState.snake.forEach((segment, index) => {
            if (index === 0) {
                this.drawSnakeHead(segment);
            } else {
                const x = (segment.x + 0.5) * this.config.gridSize;
                const y = (segment.y + 0.5) * this.config.gridSize;
                ctx.moveTo(x + this.config.gridSize/2 - 2, y);
                ctx.arc(x, y, this.config.gridSize/2 - 2, 0, Math.PI * 2);
            }
        });
        
        // 一次性填充所有蛇身
        ctx.fillStyle = this.currentTheme.snake.body;
        ctx.fill();
    }

    // 优化食物倒计时显示
    drawFoodTimer() {
        const { ctx } = this.gameState;
        const progress = this.gameState.food.timeLeft / 100;
        const x = (this.gameState.food.x + 0.5) * this.config.gridSize;
        const y = (this.gameState.food.y + 0.5) * this.config.gridSize;
        
        ctx.beginPath();
        ctx.arc(x, y, this.config.gridSize * 0.6, 0, Math.PI * 2 * progress);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    gameOver(reason = 'collision') {
        this.gameState.gameOver = true;
        if (this.gameState.gameLoop) {
            cancelAnimationFrame(this.gameState.gameLoop);
            this.gameState.gameLoop = null;
        }
        
        if (window.gameManager) {
            window.gameManager.saveScore();
        }
        
        let message = '游戏结束！\n';
        switch(reason) {
            case 'timeUp':
                message += '时间到！';
                break;
            case 'collision':
                message += '撞到障碍物或自己！';
                break;
            case 'poison':
                message += '吃到毒蘑菇！';
                break;
        }
        message += `\n得分：${this.gameState.score}`;
        
        setTimeout(() => {
            alert(message);
        }, 100);
    }

    destroy() {
        if (this.gameState.gameLoop) {
            cancelAnimationFrame(this.gameState.gameLoop);
            this.gameState.gameLoop = null;
        }
        this.gameState.isPaused = true;
        this.gameState.gameOver = true;
    }

    resetGame() {
        console.log('Resetting game...');
        
        if (this.gameState.gameLoop) {
            cancelAnimationFrame(this.gameState.gameLoop);
            this.gameState.gameLoop = null;
        }
        
        this.gameState = {
            ...this.gameState,
            snake: [{x: 5, y: 5}],
            dx: 1,
            dy: 0,
            score: 0,
            isPaused: false,
            gameOver: false,
            lastRender: 0
        };
        
        document.getElementById('score').textContent = '0';
        this.generateFood();
        this.draw();
        
        console.log('Game reset complete');
    }

    checkGameStatus() {
        // 检查是否达到关卡目标
        if (this.gameState.score >= this.levelData.target) {
            if (window.gameManager) {
                window.gameManager.checkLevelComplete();
            }
            
            // 显示通关提示
            setTimeout(() => {
                const message = `恭喜！完成关卡！\n得分：${this.gameState.score}\n是否进入下一关？`;
                if (confirm(message)) {
                    const nextLevel = this.levelData.level + 1;
                    if (window.gameManager && window.gameManager.levels[nextLevel]) {
                        window.gameManager.startGame(nextLevel);
                    } else {
                        alert('恭喜！你已完成所有关卡！');
                        window.gameManager.showMainMenu();
                    }
                } else {
                    window.gameManager.showMainMenu();
                }
            }, 100);

            // 暂停游戏
            this.gameState.isPaused = true;
        }

        // 检查成就
        if (window.gameManager) {
            window.gameManager.checkAchievements();
        }

        // 检查时间限制（如果有）
        if (this.levelData.specialFeatures.timeLimit) {
            const timeElapsed = (Date.now() - this.gameState.startTime) / 1000;
            if (timeElapsed >= this.levelData.specialFeatures.timeLimit) {
                this.gameOver('timeUp');
                return;
            }
        }

        // 检查特殊效果
        this.updateEffects();
    }

    updateEffects() {
        // 更新护盾效果
        if (this.gameState.skills.shield.active) {
            // 添加护盾视觉效果
            const { ctx } = this.gameState;
            const head = this.gameState.snake[0];
            
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(
                (head.x + 0.5) * this.config.gridSize,
                (head.y + 0.5) * this.config.gridSize,
                this.config.gridSize * 0.8,
                0,
                Math.PI * 2
            );
            ctx.stroke();
        }

        // 更新减速效果
        if (this.gameState.skills.slowTime.active) {
            // 添加减速视觉效果
            const { ctx } = this.gameState;
            ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
            ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
        }

        // 更新磁铁效果
        if (this.gameState.skills.magnet.active) {
            // 添加磁铁视觉效果
            this.drawMagneticField();
        }
    }

    drawMagneticField() {
        const { ctx } = this.gameState;
        const head = this.gameState.snake[0];
        
        const gradient = ctx.createRadialGradient(
            (head.x + 0.5) * this.config.gridSize,
            (head.y + 0.5) * this.config.gridSize,
            0,
            (head.x + 0.5) * this.config.gridSize,
            (head.y + 0.5) * this.config.gridSize,
            this.config.gridSize * 3
        );
        
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            (head.x - 2) * this.config.gridSize,
            (head.y - 2) * this.config.gridSize,
            this.config.gridSize * 5,
            this.config.gridSize * 5
        );
    }

    // 添加特效绘制方法
    drawEffects() {
        if (this.gameState.skills.shield.active) {
            this.drawShieldEffect();
        }
        if (this.gameState.skills.slowTime.active) {
            this.drawSlowTimeEffect();
        }
        if (this.gameState.skills.magnet.active) {
            this.drawMagnetEffect();
        }
    }

    drawShieldEffect() {
        const { ctx } = this.gameState;
        const head = this.gameState.snake[0];
        
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(
            (head.x + 0.5) * this.config.gridSize,
            (head.y + 0.5) * this.config.gridSize,
            this.config.gridSize * 0.8,
            0,
            Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
    }

    drawSlowTimeEffect() {
        const { ctx } = this.gameState;
        ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
        ctx.fillRect(0, 0, this.config.canvas.width, this.config.canvas.height);
    }

    drawMagnetEffect() {
        const { ctx } = this.gameState;
        const head = this.gameState.snake[0];
        
        const gradient = ctx.createRadialGradient(
            (head.x + 0.5) * this.config.gridSize,
            (head.y + 0.5) * this.config.gridSize,
            0,
            (head.x + 0.5) * this.config.gridSize,
            (head.y + 0.5) * this.config.gridSize,
            this.config.gridSize * 3
        );
        
        gradient.addColorStop(0, 'rgba(255, 0, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(
            (head.x - 2) * this.config.gridSize,
            (head.y - 2) * this.config.gridSize,
            this.config.gridSize * 5,
            this.config.gridSize * 5
        );
    }

    // 添加默认主题方法
    loadDefaultTheme() {
        this.currentTheme = {
            background: '#000000',
            snake: {
                head: '#32CD32',
                body: '#228B22'
            },
            food: '#FF0000',
            obstacles: '#808080',
            gridLines: '#1a1a1a'
        };
        
        // 创建基本的蛇的外观
        this.snakeTheme = {
            head: this.createBasicSnakeHead(),
            body: this.createBasicSnakeBody()
        };
    }

    // 添加基本的蛇头绘制方法
    createBasicSnakeHead() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#32CD32';
        ctx.fillRect(0, 0, 40, 40);
        
        return canvas;
    }

    // 添加基本的蛇身绘制方法
    createBasicSnakeBody() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, 40, 40);
        
        return canvas;
    }

    // 添加绘制蛇眼睛的方法
    drawSnakeEyes(head) {
        const { ctx } = this.gameState;
        const centerX = (head.x + 0.5) * this.config.gridSize;
        const centerY = (head.y + 0.5) * this.config.gridSize;
        const radius = this.config.gridSize / 2;
        const eyeOffset = radius * 0.3;

        // 根据移动方向计算眼睛位置
        let eyeX1, eyeX2, eyeY1, eyeY2;
        if (this.gameState.dx === 1) { // 向右
            eyeX1 = eyeX2 = centerX + eyeOffset;
            eyeY1 = centerY - eyeOffset;
            eyeY2 = centerY + eyeOffset;
        } else if (this.gameState.dx === -1) { // 向左
            eyeX1 = eyeX2 = centerX - eyeOffset;
            eyeY1 = centerY - eyeOffset;
            eyeY2 = centerY + eyeOffset;
        } else if (this.gameState.dy === -1) { // 向上
            eyeY1 = eyeY2 = centerY - eyeOffset;
            eyeX1 = centerX - eyeOffset;
            eyeX2 = centerX + eyeOffset;
        } else { // 向下
            eyeY1 = eyeY2 = centerY + eyeOffset;
            eyeX1 = centerX - eyeOffset;
            eyeX2 = centerX + eyeOffset;
        }

        // 绘制眼白
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, radius * 0.2, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        // 绘制瞳孔
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(eyeX1, eyeY1, radius * 0.1, 0, Math.PI * 2);
        ctx.arc(eyeX2, eyeY2, radius * 0.1, 0, Math.PI * 2);
        ctx.fill();
    }

    // 绘制可爱的蛇头
    drawSnakeHead(head) {
        const { ctx } = this.gameState;
        const x = (head.x + 0.5) * this.config.gridSize;
        const y = (head.y + 0.5) * this.config.gridSize;
        const size = this.config.gridSize;

        // 保存当前状态
        ctx.save();
        ctx.translate(x, y);

        // 根据移动方向旋转
        let angle = 0;
        if (this.gameState.dx === 1) angle = 0;
        if (this.gameState.dx === -1) angle = Math.PI;
        if (this.gameState.dy === -1) angle = -Math.PI/2;
        if (this.gameState.dy === 1) angle = Math.PI/2;
        ctx.rotate(angle);

        // 绘制头部主体（圆形）
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(0, 0, size/2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // 绘制大眼睛
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(-size/6, -size/6, size/6, 0, Math.PI * 2);
        ctx.arc(size/6, -size/6, size/6, 0, Math.PI * 2);
        ctx.fill();

        // 绘制眼珠
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(-size/6, -size/6, size/10, 0, Math.PI * 2);
        ctx.arc(size/6, -size/6, size/10, 0, Math.PI * 2);
        ctx.fill();

        // 绘制可爱的笑脸
        ctx.strokeStyle = '#388E3C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, size/8, size/4, 0, Math.PI);
        ctx.stroke();

        // 绘制腮红
        ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
        ctx.beginPath();
        ctx.arc(-size/3, size/6, size/8, 0, Math.PI * 2);
        ctx.arc(size/3, size/6, size/8, 0, Math.PI * 2);
        ctx.fill();

        // 恢复状态
        ctx.restore();
    }

    // 绘制蛇身体段
    drawSnakeBody(segment, index) {
        const { ctx } = this.gameState;
        const x = (segment.x + 0.5) * this.config.gridSize;
        const y = (segment.y + 0.5) * this.config.gridSize;
        const size = this.config.gridSize;

        // 创建渐变色
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size/2);
        gradient.addColorStop(0, '#81C784');
        gradient.addColorStop(0.6, '#4CAF50');
        gradient.addColorStop(1, '#388E3C');

        // 绘制身体段（圆形）
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size/2 - 2, 0, Math.PI * 2);
        ctx.fill();

        // 添加花纹
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, size/3, 0, Math.PI * 2);
        ctx.stroke();
    }

    // 绘制食物
    drawFood() {
        const { ctx } = this.gameState;
        const x = (this.gameState.food.x + 0.5) * this.config.gridSize;
        const y = (this.gameState.food.y + 0.5) * this.config.gridSize;
        const size = this.config.gridSize;

        // 绘制星星
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Date.now() * 0.003); // 旋转动画

        // 创建渐变
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size/2);
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.7, '#FFA500');
        gradient.addColorStop(1, '#FF8C00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const innerAngle = angle + Math.PI / 5;
            
            if (i === 0) {
                ctx.moveTo(Math.cos(angle) * size/2, Math.sin(angle) * size/2);
            } else {
                ctx.lineTo(Math.cos(angle) * size/2, Math.sin(angle) * size/2);
            }
            
            ctx.lineTo(
                Math.cos(innerAngle) * size/4,
                Math.sin(innerAngle) * size/4
            );
        }
        ctx.closePath();
        ctx.fill();

        // 添加光晕效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFD700';
        ctx.fill();

        ctx.restore();
    }

    // 添加边界障碍物（专家模式）
    addBoundaryObstacles() {
        const size = this.config.gridCount;
        const currentSize = size - this.gameState.boundaryLevel * 2;
        
        if (currentSize <= 10) return; // 保持最小游戏区域

        this.gameState.boundaryLevel = (this.gameState.boundaryLevel || 0) + 1;
        const level = this.gameState.boundaryLevel;

        // 添加新的边界障碍物
        for (let i = level - 1; i < size - level + 1; i++) {
            this.gameState.obstacles.push(
                {x: level - 1, y: i, type: 'boundary'},
                {x: size - level, y: i, type: 'boundary'},
                {x: i, y: level - 1, type: 'boundary'},
                {x: i, y: size - level, type: 'boundary'}
            );
        }
    }

    // 更新移动障碍物
    updateMovingObstacles(speed, deltaTime) {
        this.gameState.obstacles.forEach(obstacle => {
            if (obstacle.pattern === 'horizontal') {
                obstacle.x += Math.cos(Date.now() / 1000) * speed * deltaTime * 0.1;
                obstacle.x = Math.max(0, Math.min(this.config.gridCount - 1, obstacle.x));
            } else if (obstacle.pattern === 'vertical') {
                obstacle.y += Math.sin(Date.now() / 1000) * speed * deltaTime * 0.1;
                obstacle.y = Math.max(0, Math.min(this.config.gridCount - 1, obstacle.y));
            }
        });
    }
}

// 确保 SnakeGame 类在全局作用域可用
window.SnakeGame = SnakeGame;