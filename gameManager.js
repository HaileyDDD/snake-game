class GameManager {
    constructor() {
        try {
            this.game = null;
            this.currentLevel = 1;
            this.unlockedLevels = this.loadUnlockedLevels();
            this.leaderboard = this.loadLeaderboard();
            this.achievements = this.loadAchievements();
            
            this.levels = {
                1: {
                    name: "彩虹之路",
                    description: "初始关卡 - 穿墙模式",
                    target: 50,
                    obstacles: [],
                    specialFeatures: {
                        wallPass: true,     // 可以穿墙
                        foodValue: 10,
                        speed: 200,
                        foodTypes: ['normal']  // 只有普通食物
                    },
                    unlocked: true
                },
                2: {
                    name: "星际穿越",
                    description: "小心陨石，收集星星能量",
                    target: 100,
                    obstacles: [
                        // 移动的陨石障碍
                        {x: 8, y: 8, type: 'moving', pattern: 'horizontal', range: 5, speed: 1},
                        {x: 12, y: 12, type: 'moving', pattern: 'vertical', range: 5, speed: 1},
                        // 固定的黑洞
                        {x: 5, y: 5, type: 'blackhole', effect: 'teleport'},
                        {x: 15, y: 15, type: 'blackhole', effect: 'teleport'}
                    ],
                    specialFeatures: {
                        wallPass: false,
                        foodValue: 15,
                        speed: 180,
                        specialFood: {
                            star: {points: 30, effect: 'speedBoost'},
                            energy: {points: 20, effect: 'shield'}
                        },
                        background: 'space'
                    },
                    unlocked: true
                },
                3: {
                    name: "魔法森林",
                    description: "使用魔法门快速移动，躲避魔法生物",
                    target: 150,
                    obstacles: [
                        // 传送门对
                        {x: 5, y: 5, type: 'portal_blue', pair: 1},
                        {x: 15, y: 15, type: 'portal_blue', pair: 1},
                        {x: 3, y: 17, type: 'portal_orange', pair: 2},
                        {x: 17, y: 3, type: 'portal_orange', pair: 2},
                        // 魔法生物（移动的敌人）
                        {x: 10, y: 10, type: 'creature', pattern: 'chase', speed: 0.5}
                    ],
                    specialFeatures: {
                        wallPass: false,
                        foodValue: 20,
                        speed: 160,
                        magicEffects: true,
                        foodTypes: ['normal', 'magic', 'poison'],
                        background: 'forest'
                    },
                    unlocked: true
                },
                4: {
                    name: "海底探险",
                    description: "在水流中游动，收集珍珠",
                    target: 200,
                    obstacles: [
                        // 水流区域
                        {x: 5, y: 5, type: 'current', direction: 'right', strength: 2},
                        {x: 15, y: 15, type: 'current', direction: 'left', strength: 2},
                        // 海藻（减速区域）
                        {x: 10, y: 10, type: 'seaweed', effect: 'slow'},
                        // 气泡（加速区域）
                        {x: 8, y: 8, type: 'bubble', effect: 'boost'}
                    ],
                    specialFeatures: {
                        wallPass: false,
                        foodValue: 25,
                        speed: 150,
                        underwater: true,
                        bubbleEffect: true,
                        foodTypes: ['normal', 'pearl', 'pufferfish'],
                        background: 'underwater'
                    },
                    unlocked: true
                },
                5: {
                    name: "火山冒险",
                    description: "躲避熔岩，寻找宝藏",
                    target: 250,
                    obstacles: [
                        // 熔岩池（致命区域）
                        {x: 5, y: 5, type: 'lava', effect: 'deadly', size: 3},
                        // 喷发的火山（定时伤害）
                        {x: 15, y: 15, type: 'volcano', interval: 5000},
                        // 热气（减速区域）
                        {x: 10, y: 10, type: 'heatwave', effect: 'slow', range: 2}
                    ],
                    specialFeatures: {
                        wallPass: false,
                        foodValue: 30,
                        speed: 130,
                        heatEffect: true,
                        foodTypes: ['normal', 'treasure', 'crystal'],
                        background: 'volcano',
                        timeLimit: 120  // 限时2分钟
                    },
                    unlocked: true
                }
            };
            
            this.initializeUI();
            this.initializeEventListeners();
            window.gameManager = this;

            // 添加一些初始的排行榜数据
            if (this.leaderboard.length === 0) {
                this.leaderboard = [
                    { playerName: "玩家1", score: 200, level: 1, difficulty: "medium", date: "2024/1/1" },
                    { playerName: "玩家2", score: 180, level: 2, difficulty: "hard", date: "2024/1/2" },
                    { playerName: "玩家3", score: 150, level: 1, difficulty: "easy", date: "2024/1/3" }
                ];
                localStorage.setItem('snakeLeaderboard', JSON.stringify(this.leaderboard));
            }

            // 确保在初始化时显示主菜单
            this.hideAllMenus();
            this.showMainMenu();

            console.log('GameManager initialized successfully');
        } catch (error) {
            console.error('Error initializing GameManager:', error);
        }
    }

    initializeUI() {
        // 添加关卡选择按钮的事件监听
        const levelSelectBtn = document.getElementById('levelSelectBtn');
        if (levelSelectBtn) {
            levelSelectBtn.addEventListener('click', () => this.showLevelSelect());
        }

        // 其他按钮的事件监听
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        document.getElementById('menuBtn')?.addEventListener('click', () => this.showMainMenu());
        
        // 初始化关卡选择界面
        this.initializeLevelSelect();
    }

    startGame(level = 1) {
        try {
            console.log('Starting game with level:', level);
            
            // 检查 SnakeGame 类是否存在
            if (typeof SnakeGame === 'undefined') {
                throw new Error('SnakeGame class is not loaded');
            }
            
            this.hideAllMenus();
            const gameContainer = document.querySelector('.game-container');
            if (gameContainer) {
                gameContainer.style.display = 'block';
                this.currentLevel = level;
                
                if (this.game) {
                    this.game.destroy();
                    this.game = null;
                }
                
                const levelData = {
                    ...this.levels[level],
                    level: level
                };
                
                // 创建新的游戏实例
                this.game = new SnakeGame(levelData);
                
                // 更新显示
                document.getElementById('level').textContent = level;
                document.getElementById('levelGoal').textContent = `目标分数: ${levelData.target}`;
                
                console.log('Game initialized successfully');
            }
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }

    showMainMenu() {
        this.hideAllMenus();
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.style.display = 'flex';
        }
        // 启用滚动
        document.body.style.overflow = 'auto';
    }

    showLeaderboard() {
        this.hideAllMenus();
        document.getElementById('leaderboardMenu').style.display = 'flex';
        this.updateLeaderboardDisplay();
    }

    showLevelSelect() {
        console.log('Showing level select menu'); // 添加调试日志
        this.hideAllMenus();
        const levelSelect = document.getElementById('levelSelect');
        if (levelSelect) {
            levelSelect.style.display = 'flex';
            // 重新初始化关卡列表，确保最新状态
            this.initializeLevelSelect();
        }
    }

    showHelp() {
        this.hideAllMenus();
        
        // 检查是否已存在帮助菜单
        const existingHelpMenu = document.querySelector('.help-menu-container');
        if (existingHelpMenu) {
            existingHelpMenu.style.display = 'flex';
            return;
        }

        const helpContent = `
            <div class="menu">
                <h2>游戏帮助</h2>
                <div class="help-content">
                    <h3>基本操作：</h3>
                    <p>- 使用方向键控制蛇的移动</p>
                    <p>- 空格键暂停/继续游戏</p>
                    
                    <h3>游戏规则：</h3>
                    <p>- 吃到普通食物（红苹果）得10分</p>
                    <p>- 吃到特殊食物（金苹果）得30分</p>
                    <p>- 撞到墙壁或自己会游戏结束</p>
                    <p>- 达到目标分数解锁下一关</p>
                    
                    <h3>关卡说明：</h3>
                    <p>第一关：新手村 - 基础训练</p>
                    <p>第二关：丛林冒险 - 有简单障碍</p>
                    <p>第三关：迷宫挑战 - 复杂地形</p>
                </div>
                <button class="menu-button" onclick="gameManager.handleBackButton()">返回</button>
            </div>
        `;
        
        const helpMenu = document.createElement('div');
        helpMenu.className = 'menu-container help-menu-container';
        helpMenu.style.display = 'flex';
        helpMenu.innerHTML = helpContent;
        document.body.appendChild(helpMenu);
    }

    hideAllMenus() {
        // 先移除可能存在的帮助菜单
        const existingHelpMenu = document.querySelector('.menu-container:not(#mainMenu):not(#leaderboardMenu):not(#levelSelect)');
        if (existingHelpMenu) {
            existingHelpMenu.remove();
        }

        // 隐藏其他菜单
        const menus = [
            'mainMenu',
            'leaderboardMenu',
            'levelSelect'
        ];
        
        menus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.style.display = 'none';
            }
        });

        // 隐藏游戏容器
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.style.display = 'none';
        }
    }

    // 关卡系统
    initializeLevelSelect() {
        console.log('Initializing level select');
        const levelList = document.getElementById('levelList');
        if (!levelList) return;

        levelList.innerHTML = '';
        
        Object.entries(this.levels).forEach(([levelNum, levelData]) => {
            const levelButton = document.createElement('button');
            levelButton.className = 'menu-button level-button';
            levelButton.innerHTML = `
                <div style="text-align: center;">
                    <h3 style="margin: 10px 0;">${levelData.name}</h3>
                    <p style="margin: 5px 0;">${levelData.description}</p>
                    <p style="margin: 5px 0;">目标分数: ${levelData.target}</p>
                </div>
            `;
            
            levelButton.addEventListener('click', () => {
                console.log(`Starting level ${levelNum}`);
                this.startGame(parseInt(levelNum));
            });
            
            levelList.appendChild(levelButton);
        });
    }

    // 排行榜系统
    loadLeaderboard() {
        return JSON.parse(localStorage.getItem('snakeLeaderboard')) || [];
    }

    saveScore() {
        // 游戏结束时自动保存分数
        const newScore = {
            playerName: "玩家" + (this.leaderboard.length + 1),  // 自动生成玩家名
            score: this.game.score,
            level: this.currentLevel,
            difficulty: document.getElementById('difficulty').value,
            date: new Date().toLocaleDateString()
        };
        
        this.leaderboard.push(newScore);
        this.leaderboard.sort((a, b) => b.score - a.score);
        this.leaderboard = this.leaderboard.slice(0, 10); // 只保留前10名
        
        localStorage.setItem('snakeLeaderboard', JSON.stringify(this.leaderboard));
        this.updateLeaderboardDisplay();
    }

    updateLeaderboardDisplay() {
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        this.leaderboard.forEach((score, index) => {
            const scoreElement = document.createElement('div');
            scoreElement.className = 'leaderboard-item';
            scoreElement.innerHTML = `
                <span>#${index + 1}</span>
                <span>${score.playerName}</span>
                <span>${score.score}</span>
                <span>关卡 ${score.level}</span>
                <span>${score.difficulty}</span>
            `;
            leaderboardList.appendChild(scoreElement);
        });
    }

    // 成就系统
    loadAchievements() {
        return JSON.parse(localStorage.getItem('snakeAchievements')) || {
            firstGame: { name: "初次尝试", description: "完成第一局游戏", unlocked: false },
            scoreHundred: { name: "百分选手", description: "单局得分超过100分", unlocked: false },
            levelMaster: { name: "关卡大师", description: "解锁所有关卡", unlocked: false },
            speedRunner: { name: "快速通关", description: "在30秒内得到50分", unlocked: false },
            snakeKing: { name: "蛇王", description: "蛇的长度超过20", unlocked: false },
            goldenApple: { name: "寻宝达人", description: "吃到5个金苹果", unlocked: false }
        };
    }

    unlockAchievement(achievementId) {
        try {
            if (!this.achievements[achievementId]) {
                console.warn(`Achievement ${achievementId} not found`);
                return;
            }

            if (!this.achievements[achievementId].unlocked) {
                this.achievements[achievementId].unlocked = true;
                localStorage.setItem('snakeAchievements', JSON.stringify(this.achievements));
                this.showAchievementNotification(this.achievements[achievementId].name);
                
                // 更新成就显示
                this.updateAchievementsDisplay();
            }
        } catch (error) {
            console.error('Error unlocking achievement:', error);
        }
    }

    showAchievementNotification(achievementName) {
        const notification = document.getElementById('achievementNotification');
        if (!notification) {
            console.warn('Achievement notification element not found');
            return;
        }
        
        notification.textContent = `解锁成就：${achievementName}`;
        notification.style.display = 'block';
        
        // 添加动画效果
        notification.style.animation = 'fadeInOut 3s ease-in-out';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // 添加成就显示更新方法
    updateAchievementsDisplay() {
        const achievementsList = document.getElementById('achievementsList');
        if (!achievementsList) return;

        achievementsList.innerHTML = '';
        Object.values(this.achievements).forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            achievementElement.innerHTML = `
                <h4>${achievement.name}</h4>
                <p>${achievement.description}</p>
                ${achievement.unlocked ? '✅' : '🔒'}
            `;
            achievementsList.appendChild(achievementElement);
        });
    }

    // 存档系统
    saveGameState() {
        const gameState = {
            unlockedLevels: this.unlockedLevels,
            achievements: this.achievements,
            highScores: this.leaderboard
        };
        localStorage.setItem('snakeGameState', JSON.stringify(gameState));
    }

    loadGameState() {
        const savedState = JSON.parse(localStorage.getItem('snakeGameState'));
        if (savedState) {
            this.unlockedLevels = savedState.unlockedLevels;
            this.achievements = savedState.achievements;
            this.leaderboard = savedState.highScores;
        }
    }

    handleBackButton() {
        if (this.game) {
            this.game.isPaused = true;
        }
        this.showMainMenu();
    }

    checkAchievements() {
        try {
            if (!this.game || !this.game.gameState) return;

            // 检查分数成就
            if (this.game.gameState.score >= 100 && !this.achievements.scoreHundred.unlocked) {
                this.unlockAchievement('scoreHundred');
            }

            // 检查蛇的长度成就
            if (this.game.gameState.snake && 
                this.game.gameState.snake.length >= 20 && 
                !this.achievements.snakeKing.unlocked) {
                this.unlockAchievement('snakeKing');
            }

            // 检查第一局游戏成就
            if (!this.achievements.firstGame.unlocked) {
                this.unlockAchievement('firstGame');
            }

            // 检查速度成就
            if (this.game.gameState.score >= 50 && 
                (Date.now() - this.game.gameState.startTime) / 1000 <= 30 &&
                !this.achievements.speedRunner.unlocked) {
                this.unlockAchievement('speedRunner');
            }
        } catch (error) {
            console.error('Error checking achievements:', error);
        }
    }

    checkLevelComplete() {
        const currentLevel = this.levels[this.currentLevel];
        if (this.game.gameState.score >= currentLevel.target) {
            // 解锁下一关
            const nextLevel = this.currentLevel + 1;
            if (this.levels[nextLevel]) {
                this.levels[nextLevel].unlocked = true;
                this.saveGameState();
                this.showAchievementNotification(`解锁新关卡：${this.levels[nextLevel].name}`);
                
                // 更新关卡选择界面
                this.initializeLevelSelect();
            }
            
            // 检查是否解锁所有关卡
            if (Object.values(this.levels).every(level => level.unlocked)) {
                this.unlockAchievement('levelMaster');
            }
        }
    }

    loadUnlockedLevels() {
        const savedLevels = localStorage.getItem('unlockedLevels');
        return savedLevels ? JSON.parse(savedLevels) : [1]; // 默认解锁第一关
    }

    initializeEventListeners() {
        // 主菜单按钮事件
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.addEventListener('click', () => this.startGame(1));
        }

        const leaderboardBtn = document.getElementById('leaderboardBtn');
        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
        }

        const levelSelectBtn = document.getElementById('levelSelectBtn');
        if (levelSelectBtn) {
            levelSelectBtn.addEventListener('click', () => this.showLevelSelect());
        }

        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelp());
        }

        const menuBtn = document.getElementById('menuBtn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.handleBackButton());
        }
    }

    // 添加游戏状态检查
    checkGameState() {
        if (!this.game) return;
        
        // 检查分数
        if (this.game.score >= this.levels[this.currentLevel].target) {
            this.unlockNextLevel();
        }
        
        // 检查成就
        this.checkAchievements();
    }

    // 解锁下一关
    unlockNextLevel() {
        const nextLevel = this.currentLevel + 1;
        if (this.levels[nextLevel]) {
            this.levels[nextLevel].unlocked = true;
            this.saveGameState();
            this.showAchievementNotification(`解锁新关卡：${this.levels[nextLevel].name}`);
        }
    }
} 