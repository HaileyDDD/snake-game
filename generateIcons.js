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
            this.icons[`icon-${size}x${size}`] = canvas.toDataURL('image/png');
            
            // 如果存在对应的 link 标签，更新其 href
            const linkTag = document.querySelector(`link[sizes="${size}x${size}"]`);
            if (linkTag) {
                linkTag.href = this.icons[`icon-${size}x${size}`];
            }
        });
    }

    getIcon(size) {
        return this.icons[`icon-${size}x${size}`] || null;
    }
}

// 创建单例实例
window.iconManager = new IconManager();

// 页面加载完成后生成图标
document.addEventListener('DOMContentLoaded', () => {
    window.iconManager.generateIcons();
}); 