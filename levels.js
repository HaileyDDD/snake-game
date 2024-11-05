class LevelManager {
    constructor() {
        this.levels = [
            {
                id: 1,
                name: "彩虹之路",
                speed: 100,  // 较快的基础速度
                foodCount: 3,
                powerUpThreshold: 3,  // 吃3个食物可以变身
                obstacles: [], // 第一关无障碍，让玩家适应速度
                target: 100,  // 提高基础分数要求
                description: "初始关卡 - 穿墙模式",
                specialFeatures: {
                    wallPass: true,  // 允许穿墙
                    speedBoost: true // 变身后速度提升
                }
            },
            {
                id: 2,
                name: "魔法森林",
                speed: 80,   // 极速模式
                foodCount: 4,
                powerUpThreshold: 4,  // 吃4个食物可以变身
                obstacles: [
                    // 十字形障碍
                    {x: 10, y: 5, width: 2, height: 10},  // 竖线
                    {x: 5, y: 10, width: 10, height: 2}   // 横线
                ],
                target: 150,
                description: "使用魔法门快速移动，躲避魔法生物",
                specialFeatures: {
                    wallPass: false,     // 不能穿墙
                    speedBoost: true,    // 变身后速度提升
                    magicPortals: true   // 特殊的传送门机制
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