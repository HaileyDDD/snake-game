class IconManager {
    constructor() {
        this.icons = {};
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
            
            // 存储图标的 data URL
            const dataUrl = canvas.toDataURL('image/png');
            this.icons[`icon-${size}x${size}`] = dataUrl;
            
            // 更新页面中的图标链接
            this.updateIconLink(size, dataUrl);
        });
    }

    updateIconLink(size, dataUrl) {
        // 更新 favicon
        if (size === 16 || size === 32) {
            let link = document.querySelector(`link[sizes="${size}x${size}"]`);
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                link.type = 'image/png';
                link.sizes = `${size}x${size}`;
                document.head.appendChild(link);
            }
            link.href = dataUrl;
        }
        
        // 更新 apple-touch-icon
        if (size === 192) {
            let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
            if (appleIcon) {
                appleIcon.href = dataUrl;
            }
        }
    }

    getIcon(size) {
        return this.icons[`icon-${size}x${size}`] || null;
    }
}

// 创建单例实例
const iconManager = new IconManager();

// 页面加载完成后生成图标
document.addEventListener('DOMContentLoaded', () => {
    iconManager.generateIcons();
});

// 导出实例供其他模块使用
window.iconManager = iconManager; 