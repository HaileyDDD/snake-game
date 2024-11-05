class LevelManager {
    constructor() {
        this.levels = [
            {
                id: 1,
                name: "基础挑战",
                speed: 120,
                foodCount: 3,
                powerUpThreshold: 3,
                obstacles: [],
                target: 150,
                description: "快速收集食物，吃够3个即可变身！变身后无敌10秒！"
            },
            {
                id: 2,
                name: "地狱模式",
                speed: 90,
                foodCount: 4,
                powerUpThreshold: 4,
                obstacles: [
                    {x: 10, y: 5, width: 2, height: 10},
                    {x: 5, y: 10, width: 10, height: 2}
                ],
                target: 300,
                description: "极速模式！十字形障碍！吃够4个食物变身！"
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