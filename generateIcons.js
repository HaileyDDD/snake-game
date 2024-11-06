class IconManager {
    constructor() {
        this.icons = new Map();
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.generateIcons();
        this.updatePageIcons();
        this.initialized = true;
    }

    generateIcons() {
        const sizes = [16, 32, 192, 512];
        sizes.forEach(size => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            
            // 绘制图标
            ctx.fillStyle = '#1a1a2e';
            ctx.fillRect(0, 0, size, size);
            
            // 绘制蛇
            ctx.fillStyle = '#4CAF50';
            const snakeSize = size / 8;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(size/2 - i*snakeSize, size/2, snakeSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // 只存储在内存中，不创建下载链接
            this.icons.set(size, canvas.toDataURL('image/png'));
        });
    }

    updatePageIcons() {
        // 直接更新页面中的图标引用
        this.updateFavicon();
        this.updateAppleTouchIcon();
    }

    updateFavicon() {
        [16, 32].forEach(size => {
            let link = document.querySelector(`link[sizes="${size}x${size}"]`);
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                document.head.appendChild(link);
            }
            link.href = this.icons.get(size);
        });
    }

    updateAppleTouchIcon() {
        let link = document.querySelector('link[rel="apple-touch-icon"]');
        if (!link) {
            link = document.createElement('link');
            link.rel = 'apple-touch-icon';
            document.head.appendChild(link);
        }
        link.href = this.icons.get(192);
    }

    getIcon(size) {
        return this.icons.get(size);
    }
}

// 创建单例实例
const iconManager = new IconManager();

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        iconManager.init();
    }, 100);
});

// 导出实例供其他模块使用
window.iconManager = iconManager; 