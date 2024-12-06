import { Entity } from "./Entity.js";

export class Enemy extends Entity {
    static direction = 1; // Shared horizontal direction (1 for right, -1 for left)
    static descending = false; // Whether all enemies are descending
    static descentRowOffset = 1.5; // Z-axis offset for each descent row
    static currentRow = 0; // Tracks the current descent row for all enemies
    static descentCooldown = 3.0; // Initial cooldown to delay the first descent
    static descentInterval = 1.0; // Minimum time (in seconds) between descents

    constructor(objData, gl, material) {
        super(objData, gl, material);

        this.marchSpeed = 0.6; // Speed for marching
        this.marchBounds = this.randomizeBounds(); // Initialize random march bounds
        this.originalPosition = [0, 0, 0]; // Stores the original position in the grid
        this.cycleTime = 0; // Timer for cycling appearance
    }

    /**
     * Randomizes the horizontal movement bounds for the enemy.
     * @returns {number} - A random value between 3 and 5.
     */
    randomizeBounds() {
        return Math.random() * 2 + 3; // Random bounds between 3 and 5
    }

    /**
     * Updates the enemy's position and appearance.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    static groupUpdate(deltaTime, enemies) {
        // Handle cooldown timer for descent
        if (Enemy.descentCooldown > 0) {
            Enemy.descentCooldown -= deltaTime;
        }

        // Check if a descent should start
        if (!Enemy.descending && Enemy.descentCooldown <= 0) {
            Enemy.descending = true; // Trigger descent
            Enemy.descentCooldown = Math.random() * 2 + Enemy.descentInterval; // Randomize next descent interval
        }

        // Handle descent logic
        if (Enemy.descending) {
            const targetZ = Enemy.currentRow * Enemy.descentRowOffset;

            let allAligned = true;
            for (const enemy of enemies) {
                // Ensure grid alignment for descent
                const targetPosZ = enemy.originalPosition[2] + targetZ;
                enemy.position[2] += (targetPosZ - enemy.position[2]) * 0.1;

                // Check if this enemy is aligned with the target row
                if (Math.abs(enemy.position[2] - targetPosZ) > 0.01) {
                    allAligned = false;
                }
            }

            // If all enemies are aligned, stop the descent
            if (allAligned) {
                Enemy.descending = false;
                Enemy.currentRow++; // Move to the next row for future descents
            }
        } else {
            // Handle marching logic
            for (const enemy of enemies) {
                enemy.position[0] += Enemy.direction * enemy.marchSpeed * deltaTime;

                // Reverse direction if bounds are exceeded
                if (
                    enemy.position[0] > enemy.marchBounds ||
                    enemy.position[0] < -enemy.marchBounds
                ) {
                    Enemy.direction *= -1; // Reverse direction
                }
            }
        }

        // Cycle appearance for all enemies
        for (const enemy of enemies) {
            enemy.cycleTime += deltaTime;
            if (enemy.cycleTime >= 0.5) {
                enemy.cycleAppearance();
                enemy.cycleTime = 0;
            }

            // Update model matrix for rendering
            enemy.update(deltaTime);
        }
    }

    /**
     * Changes the enemy's appearance (e.g., color or scale).
     */
    cycleAppearance() {
        this.material.setUniform("uColor", [Math.random(), Math.random(), Math.random(), 1.0]); // Change color
    }

    destroy(scene) {
        super.destroy(scene); // Call the base class destroy method
        console.log("Enemy destroyed!");
    }
}
