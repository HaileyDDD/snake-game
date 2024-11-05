class LevelManager {
    constructor() {
        this.levels = [
            {
                id: 1,
                name: "挑战模式",
                speed: 90,  // 更快的基础速度
                foodCount: 3,
                powerUpThreshold: 3,  // 吃3个食物可以变身
                obstacles: [], // 第一关无障碍但速度快
                target: 100,
                description: "高速模式 - 连续吃到3个食物可以变身！",
                specialFeatures: {
                    wallPass: false,  // 不能穿墙
                    speedBoost: true, // 变身后速度提升
                    powerUpDuration: 8000 // 8秒变身时间
                }
            },
            {
                id: 2,
                name: "地狱模式",
                speed: 70,   // 极速模式
                foodCount: 4,
                powerUpThreshold: 4,
                obstacles: [
                    // 迷宫式障碍
                    {x: 5, y: 5, width: 10, height: 2},
                    {x: 5, y: 13, width: 10, height: 2},
                    {x: 13, y: 5, width: 2, height: 10},
                    // 随机小障碍
                    {x: 3, y: 3, width: 2, height: 2},
                    {x: 15, y: 15, width: 2, height: 2},
                    {x: 3, y: 15, width: 2, height: 2},
                    {x: 15, y: 3, width: 2, height: 2}
                ],
                target: 200,
                description: "极限挑战 - 高速+迷宫模式！",
                specialFeatures: {
                    wallPass: false,
                    speedBoost: true,
                    powerUpDuration: 5000, // 5秒变身时间
                    randomObstacles: true  // 障碍物会随机移动
                }
            }
        ];
        this.currentLevel = 1;
    }

    getLevelConfig(levelId) {
        return this.levels.find(level => level.id === levelId) || this.levels[0];
    }

    getCurrentLevel() {
        return this.getLevelConfig(this.currentLevel);
    }

    nextLevel() {
        if (this.currentLevel < this.levels.length) {
            this.currentLevel++;
            return this.getCurrentLevel();
        }
        return null;
    }
} 