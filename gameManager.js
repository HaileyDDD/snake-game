class GameManager {
    constructor() {
        this.game = null;
        this.currentMenu = 'main';
    }

    init() {
        console.log('Initializing game manager...');
        this.initializeEventListeners();
        this.game = new Game();
        this.game.init();
        console.log('Game manager initialized successfully');
    }

    initializeEventListeners() {
        document.getElementById('levelSelectBtn').addEventListener('click', () => {
            this.showMenu('levelSelect');
            this.initializeLevelSelect();
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            this.hideAllMenus();
            this.showGameContainer();
        });
    }

    initializeLevelSelect() {
        const levelList = document.getElementById('levelList');
        levelList.innerHTML = '';
        
        this.game.levelManager.levels.forEach(level => {
            const button = document.createElement('button');
            button.className = 'level-button';
            button.innerHTML = `
                <h3>${level.name}</h3>
                <p>${level.description}</p>
            `;
            button.onclick = () => this.startLevel(level.id);
            levelList.appendChild(button);
        });
    }

    startLevel(levelId) {
        this.hideAllMenus();
        this.showGameContainer();
        this.game.loadLevel(this.game.levelManager.getLevelConfig(levelId));
    }
}

// 初始化游戏管理器
window.addEventListener('DOMContentLoaded', () => {
    const gameManager = new GameManager();
    gameManager.init();
    window.gameManager = gameManager; // 使其全局可访问
}); 