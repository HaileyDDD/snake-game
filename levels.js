class LevelManager {
    constructor() {
        this.levels = [
            {
                id: 1,
                name: "极速挑战",
                speed: 80,  // 更快的基础速度
                foodCount: 3,
                powerUpThreshold: 3,  // 吃3个食物可以变身
                obstacles: [
                    // 简单的十字形障碍
                    {x: 10, y: 5, width: 2, height: 10},
                    {x: 5, y: 10, width: 10, height: 2}
                ],
                target: 150,
                description: "极速模式 - 连续吃到3个食物获得无敌变身！",
                specialFeatures: {
                    wallPass: true,     // 可以穿墙
                    speedBoost: true,   // 变身后速度提升
                    powerUpDuration: 8000, // 8秒变身时间
                    powerUpEffects: {
                        invincible: true,
                        rainbow: true,
                        speedMultiplier: 1.3
                    }
                }
            },
            {
                id: 2,
                name: "地狱迷宫",
                speed: 60,   // 超高速模式
                foodCount: 4,
                powerUpThreshold: 4,
                obstacles: [
                    // 迷宫式障碍
                    {x: 5, y: 5, width: 10, height: 2},
                    {x: 5, y: 13, width: 10, height: 2},
                    {x: 13, y: 5, width: 2, height: 10},
                    // 四角障碍
                    {x: 2, y: 2, width: 3, height: 3},
                    {x: 15, y: 15, width: 3, height: 3},
                    {x: 2, y: 15, width: 3, height: 3},
                    {x: 15, y: 2, width: 3, height: 3}
                ],
                target: 300,
                description: "地狱模式 - 超高速+复杂迷宫！变身后获得特殊能力！",
                specialFeatures: {
                    wallPass: false,
                    speedBoost: true,
                    powerUpDuration: 5000, // 5秒变身时间
                    powerUpEffects: {
                        invincible: true,
                        rainbow: true,
                        speedMultiplier: 1.5,
                        ghostMode: true, // 可以穿过障碍物
                        magneticFood: true // 吸引食物
                    },
                    movingObstacles: true, // 障碍物会移动
                    foodBehavior: 'teleport' // 食物会随机传送
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

    // 添加新方法：获取关卡难度描述
    getLevelDifficulty(levelId) {
        const level = this.getLevelConfig(levelId);
        const difficultyFactors = {
            speed: level.speed,
            obstacles: level.obstacles.length,
            powerUpThreshold: level.powerUpThreshold,
            target: level.target
        };
        
        // 计算综合难度
        const difficulty = 
            (100 - difficultyFactors.speed) * 0.4 +
            difficultyFactors.obstacles * 10 +
            difficultyFactors.powerUpThreshold * 5 +
            (difficultyFactors.target / 100) * 20;
        
        if (difficulty < 50) return "简单";
        if (difficulty < 100) return "中等";
        if (difficulty < 150) return "困难";
        return "地狱";
    }

    // 添加新方法：获取关卡特性描述
    getLevelFeatures(levelId) {
        const level = this.getLevelConfig(levelId);
        const features = [];
        
        if (level.specialFeatures.wallPass) features.push("穿墙");
        if (level.specialFeatures.speedBoost) features.push("加速");
        if (level.specialFeatures.ghostMode) features.push("幽灵模式");
        if (level.specialFeatures.magneticFood) features.push("磁力食物");
        if (level.specialFeatures.movingObstacles) features.push("移动障碍");
        
        return features;
    }
} 