class LevelManager {
    constructor() {
        this.levels = [
            {
                id: 1,
                name: "挑战模式",
                speed: 100,
                foodCount: 3,
                powerUpThreshold: 3,
                obstacles: [
                    {x: 5, y: 5, width: 2, height: 2},
                    {x: 15, y: 15, width: 2, height: 2}
                ],
                target: 200,
                description: "收集食物并躲避障碍物，吃够3个食物可以变身！变身后无敌且加速！"
            },
            {
                id: 2,
                name: "地狱模式",
                speed: 80,
                foodCount: 4,
                powerUpThreshold: 4,
                obstacles: [
                    {x: 5, y: 5, width: 10, height: 2},
                    {x: 5, y: 13, width: 10, height: 2},
                    {x: 13, y: 5, width: 2, height: 10}
                ],
                target: 500,
                description: "极速挑战！迷宫式障碍！吃够4个食物变身！"
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