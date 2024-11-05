class ThemeManager {
    constructor() {
        this.currentTheme = 'default';
        this.themes = {
            default: {
                backgroundColor: '#000000',
                snakeColor: '#00ff00',
                foodColor: '#ff0000',
                borderColor: '#ffffff'
            },
            light: {
                backgroundColor: '#ffffff',
                snakeColor: '#2ecc71',
                foodColor: '#e74c3c',
                borderColor: '#000000'
            }
        };
    }

    init() {
        this.applyTheme(this.currentTheme);
    }

    applyTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        const theme = this.themes[themeName];
        const gameBoard = document.getElementById('gameBoard');
        
        if (gameBoard) {
            gameBoard.style.backgroundColor = theme.backgroundColor;
            gameBoard.style.borderColor = theme.borderColor;
        }
        
        this.currentTheme = themeName;
    }

    getCurrentTheme() {
        return this.themes[this.currentTheme];
    }
}

// 导出主题管理器
window.ThemeManager = ThemeManager; 