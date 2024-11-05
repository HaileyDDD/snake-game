class GameManager {
    constructor() {
        this.game = null;
        this.themeManager = null;
        this.currentMenu = 'main'; // 追踪当前菜单状态
    }

    init() {
        this.themeManager = new ThemeManager();
        this.themeManager.init();
        
        // 初始化按钮事件监听
        this.initializeEventListeners();
        
        // 初始化游戏实例
        this.game = new Game();
        this.game.init();
    }

    initializeEventListeners() {
        // 主菜单按钮
        document.getElementById('levelSelectBtn').addEventListener('click', () => {
            this.showMenu('levelSelect');
        });

        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.showMenu('leaderboard');
        });

        document.getElementById('helpBtn').addEventListener('click', () => {
            this.hideAllMenus();
            this.showGameContainer();
        });

        // 返回按钮的处理
        const backButtons = document.querySelectorAll('[onclick="gameManager.handleBackButton()"]');
        backButtons.forEach(button => {
            button.onclick = () => this.handleBackButton();
        });
    }

    showMenu(menuId) {
        this.hideAllMenus();
        document.getElementById(menuId + 'Menu').style.display = 'flex';
        this.currentMenu = menuId;
    }

    hideAllMenus() {
        const menus = ['mainMenu', 'leaderboardMenu', 'levelSelect'];
        menus.forEach(menu => {
            document.getElementById(menu).style.display = 'none';
        });
    }

    showGameContainer() {
        document.querySelector('.game-container').style.display = 'block';
    }

    handleBackButton() {
        if (this.currentMenu === 'main') {
            return;
        }
        this.hideAllMenus();
        this.showMenu('main');
    }
}

// 初始化游戏管理器
window.addEventListener('DOMContentLoaded', () => {
    const gameManager = new GameManager();
    gameManager.init();
    window.gameManager = gameManager; // 使其全局可访问
}); 