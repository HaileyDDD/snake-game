class GameManager {
    constructor() {
        this.game = null;
        this.currentMenu = 'main';
    }

    init() {
        console.log('Initializing game manager...');
        this.game = new Game();
        this.game.init();
        this.initializeEventListeners();
        this.showMenu('main');
        console.log('Game manager initialized successfully');
    }

    initializeEventListeners() {
        const levelSelectBtn = document.getElementById('levelSelectBtn');
        const helpBtn = document.getElementById('helpBtn');
        const leaderboardBtn = document.getElementById('leaderboardBtn');
        const backButtons = document.querySelectorAll('.back-button');

        if (levelSelectBtn) {
            levelSelectBtn.addEventListener('click', () => {
                this.showMenu('levelSelect');
                this.initializeLevelSelect();
            });
        }

        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.hideAllMenus();
                this.showGameContainer();
            });
        }

        if (leaderboardBtn) {
            leaderboardBtn.addEventListener('click', () => {
                this.showMenu('leaderboard');
            });
        }

        backButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleBackButton());
        });
    }

    showMenu(menuId) {
        console.log('Showing menu:', menuId);
        this.hideAllMenus();
        this.hideGameContainer();
        
        let menuElement;
        if (menuId === 'levelSelect') {
            menuElement = document.getElementById('levelSelect');
        } else {
            menuElement = document.getElementById(menuId + 'Menu');
        }
        
        if (menuElement) {
            menuElement.style.display = 'flex';
            this.currentMenu = menuId;
        } else {
            console.error('Menu not found:', menuId);
        }
    }

    hideAllMenus() {
        const menus = ['mainMenu', 'leaderboardMenu', 'levelSelect'];
        menus.forEach(menu => {
            const element = document.getElementById(menu);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    showGameContainer() {
        const container = document.querySelector('.game-container');
        if (container) {
            container.style.display = 'block';
        }
    }

    hideGameContainer() {
        const container = document.querySelector('.game-container');
        if (container) {
            container.style.display = 'none';
        }
    }

    handleBackButton() {
        console.log('Handling back button, current menu:', this.currentMenu);
        if (this.currentMenu === 'main') {
            return;
        }
        this.hideAllMenus();
        this.showMenu('main');
    }

    initializeLevelSelect() {
        console.log('Initializing level select');
        const levelList = document.getElementById('levelList');
        if (!levelList) {
            console.error('Level list element not found');
            return;
        }

        levelList.innerHTML = '';
        
        this.game.levelManager.levels.forEach(level => {
            const button = document.createElement('button');
            button.className = 'level-button';
            button.innerHTML = `
                <h3>${level.name}</h3>
                <p>${level.description}</p>
                <p>目标分数: ${level.target}</p>
            `;
            button.addEventListener('click', () => this.startLevel(level.id));
            levelList.appendChild(button);
        });
    }

    startLevel(levelId) {
        console.log('Starting level', levelId);
        this.hideAllMenus();
        this.showGameContainer();
        const levelConfig = this.game.levelManager.getLevelConfig(levelId);
        console.log('Starting game with level:', levelId);
        this.game.loadLevel(levelConfig);
    }
}

window.GameManager = GameManager; 