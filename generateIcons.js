function generateIcon(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // 绘制背景
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

    // 绘制食物
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(size/2 + snakeSize*2, size/2, snakeSize, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL('image/png');
}

// 生成不同尺寸的图标
const icons = {
    '16': generateIcon(16),
    '32': generateIcon(32),
    '192': generateIcon(192),
    '512': generateIcon(512)
};

// 保存图标
Object.entries(icons).forEach(([size, dataUrl]) => {
    const link = document.createElement('a');
    link.download = `icon-${size}x${size}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}); 