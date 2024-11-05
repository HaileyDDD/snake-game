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
        const backBtns = document.querySelectorAll('.menu-button[onclick*="handleBackButton"]');

        if (levelSelectBtn) {
            levelSelectBtn.onclick = () => {
                this.showMenu('levelSelect');
                this.initializeLevelSelect();
            };
        }

        if (helpBtn) {
            helpBtn.onclick = () => {
                this.hideAllMenus();
                this.showGameContainer();
            };
        }

        backBtns.forEach(btn => {
            btn.onclick = () => this.handleBackButton();
        });
    }

    showMenu(menuId) {
        console.log('Showing menu:', menuId);
        this.hideAllMenus();
        const menu = document.getElementById(menuId + 'Menu');
        if (menu) {
            menu.style.display = 'flex';
            this.currentMenu = menuId;
        }
    }

    hideAllMenus() {
        const menus = ['mainMenu', 'leaderboardMenu', 'levelSelect'];
        menus.forEach(menu => {
            const element = document.getElementById(menu);
            if (element) element.style.display = 'none';
        });
    }

    showGameContainer() {
        document.querySelector('.game-container').style.display = 'block';
    }

    hideGameContainer() {
        document.querySelector('.game-container').style.display = 'none';
    }

    handleBackButton() {
        if (this.currentMenu === 'main') {
            return;
        }
        this.hideAllMenus();
        this.showMenu('main');
    }

    initializeLevelSelect() {
        console.log('Initializing level select');
        const levelList = document.getElementById('levelList');
        levelList.innerHTML = '';
        
        this.game.levelManager.levels.forEach(level => {
            const button = document.createElement('button');
            button.className = 'level-button';
            button.innerHTML = `
                <h3>${level.name}</h3>
                <p>${level.description}</p>
                <p>目标分数: ${level.target}</p>
            `;
            button.onclick = () => this.startLevel(level.id);
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