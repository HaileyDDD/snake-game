class ThemeManager {
    constructor() {
        // 蛇的基本外观（所有关卡通用）
        this.snakeTheme = {
            head: this.createSnakeHead(),
            body: this.createSnakeBody()
        };

        // 关卡主题
        this.levelThemes = {
            1: {
                name: "糖果乐园",
                background: this.createCandyBackground(),
                food: this.createCandyFood(),
                obstacles: this.createCandyObstacles()
            },
            2: {
                name: "星空探险",
                background: this.createSpaceBackground(),
                food: this.createSpaceFood(),
                obstacles: this.createSpaceObstacles()
            }
        };
    }

    // 创建可爱的蛇头
    createSnakeHead() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');

        // 绘制可爱的圆形头部
        ctx.fillStyle = '#4CAF50';  // 鲜艳的绿色
        ctx.beginPath();
        ctx.arc(20, 20, 18, 0, Math.PI * 2);
        ctx.fill();

        // 添加渐变效果
        const gradient = ctx.createRadialGradient(15, 15, 0, 20, 20, 18);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 大大的可爱眼睛
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(13, 15, 7, 0, Math.PI * 2);  // 左眼
        ctx.arc(27, 15, 7, 0, Math.PI * 2);  // 右眼
        ctx.fill();

        // 闪亮的眼珠
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(13, 15, 3.5, 0, Math.PI * 2);
        ctx.arc(27, 15, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 高光效果
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(11, 13, 2, 0, Math.PI * 2);
        ctx.arc(25, 13, 2, 0, Math.PI * 2);
        ctx.fill();

        // 可爱的笑脸
        ctx.strokeStyle = '#388E3C';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(20, 23, 8, 0, Math.PI);
        ctx.stroke();

        // 红红的脸颊
        ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
        ctx.beginPath();
        ctx.arc(8, 22, 4, 0, Math.PI * 2);
        ctx.arc(32, 22, 4, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    }

    // 创建蛇身
    createSnakeBody() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');

        // 创建彩虹渐变
        const gradient = ctx.createRadialGradient(20, 20, 0, 20, 20, 18);
        gradient.addColorStop(0, '#81C784');  // 浅绿色中心
        gradient.addColorStop(0.6, '#4CAF50');  // 中绿色
        gradient.addColorStop(1, '#388E3C');  // 深绿色边缘

        // 绘制圆形身体段
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(20, 20, 16, 0, Math.PI * 2);
        ctx.fill();

        // 添加花纹装饰
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(20, 20, 6 + i * 4, 0, Math.PI * 2);
            ctx.stroke();
        }

        // 添加光泽效果
        const shine = ctx.createRadialGradient(15, 15, 0, 15, 15, 20);
        shine.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        shine.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = shine;
        ctx.fill();

        return canvas;
    }

    // 第一关 - 糖果主题
    createCandyBackground() {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // 粉色渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 400, 400);
        gradient.addColorStop(0, '#FFB6C1');
        gradient.addColorStop(0.5, '#FFC0CB');
        gradient.addColorStop(1, '#FFB6C1');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 400, 400);

        // 添加糖果装饰
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * 400;
            const y = Math.random() * 400;
            const size = Math.random() * 10 + 5;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        return canvas;
    }

    createCandyFood() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');

        // 绘制苹果主体
        ctx.fillStyle = '#FF1744';  // 鲜艳的红色
        ctx.beginPath();
        ctx.arc(20, 22, 14, 0, Math.PI * 2);
        ctx.fill();

        // 添加高光
        const gradient = ctx.createRadialGradient(15, 18, 0, 20, 22, 14);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fill();

        // 绘制叶子
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.moveTo(20, 8);
        ctx.quadraticCurveTo(15, 5, 10, 8);
        ctx.quadraticCurveTo(20, 12, 20, 8);
        ctx.fill();

        // 绘制茎
        ctx.fillStyle = '#795548';
        ctx.fillRect(19, 8, 2, 4);

        // 添加可爱的表情
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(15, 20, 3, 0, Math.PI * 2);  // 左眼
        ctx.arc(25, 20, 3, 0, Math.PI * 2);  // 右眼
        ctx.fill();

        // 添加腮红
        ctx.fillStyle = 'rgba(255, 182, 193, 0.5)';
        ctx.beginPath();
        ctx.arc(12, 26, 3, 0, Math.PI * 2);
        ctx.arc(28, 26, 3, 0, Math.PI * 2);
        ctx.fill();

        return canvas;
    }

    createCandyObstacles() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');

        // 糖果障碍物
        ctx.fillStyle = '#DDA0DD';
        ctx.beginPath();
        ctx.moveTo(20, 5);
        ctx.lineTo(35, 20);
        ctx.lineTo(20, 35);
        ctx.lineTo(5, 20);
        ctx.closePath();
        ctx.fill();

        // 添加纹理
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(20, 10);
        ctx.lineTo(20, 30);
        ctx.moveTo(10, 20);
        ctx.lineTo(30, 20);
        ctx.stroke();

        return canvas;
    }

    // 第二关 - 星空主题
    createSpaceBackground() {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        // 深空背景
        ctx.fillStyle = '#000033';
        ctx.fillRect(0, 0, 400, 400);

        // 添加星星
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * 400;
            const y = Math.random() * 400;
            const size = Math.random() * 2;
            
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // 添加星云
        const colors = ['#FF00FF', '#4B0082', '#0000FF'];
        colors.forEach(color => {
            ctx.fillStyle = `${color}33`;
            for (let i = 0; i < 3; i++) {
                const x = Math.random() * 400;
                const y = Math.random() * 400;
                ctx.beginPath();
                ctx.arc(x, y, 50 + Math.random() * 100, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        return canvas;
    }

    createSpaceFood() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');

        // 绘制星星
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
            const x = 20 + Math.cos(angle) * 15;
            const y = 20 + Math.sin(angle) * 15;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // 添加光晕
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFD700';

        return canvas;
    }

    createSpaceObstacles() {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');

        // 陨石
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 15 + Math.random() * 5;
            const x = 20 + Math.cos(angle) * radius;
            const y = 20 + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // 添加陨石纹理
        ctx.fillStyle = '#606060';
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(
                15 + Math.random() * 10,
                15 + Math.random() * 10,
                2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        return canvas;
    }

    // 获取当前关卡的主题
    getTheme(level) {
        return this.levelThemes[level] || this.levelThemes[1];
    }

    // 获取蛇的外观
    getSnakeTheme() {
        return this.snakeTheme;
    }
}

// 导出主题管理器
window.ThemeManager = ThemeManager; 