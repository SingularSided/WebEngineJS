import { Entity } from "./Entity.js";

export class Enemy extends Entity {
    static direction = 1; // Shared horizontal direction (1 for right, -1 for left)
    static gridBounds = 4; // Maximum X bounds for horizontal movement
    static descending = false; // Whether all enemies are descending
    static descentRowOffset = 1.5; // Z-axis offset for each descent row
    static currentRow = 0; // Tracks the current descent row for all enemies

    constructor(objData, gl, material) {
        super(objData, gl, material);

        this.marchSpeed = 0.6; // Speed for marching
        this.originalPosition = [0, 0, 0]; // Stores the original position in the grid
        this.cycleTime = 0; // Timer for cycling appearance
    }

    /**
     * Updates the enemy's position and appearance.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    update(deltaTime) {
        if (!Enemy.descending) {
            // Marching logic: All enemies move left or right
            this.position[0] += Enemy.direction * this.marchSpeed * deltaTime;

            // Reverse direction and trigger descent if hitting bounds
            if (this.position[0] > Enemy.gridBounds || this.position[0] < -Enemy.gridBounds) {
                Enemy.direction *= -1; // Reverse direction
                Enemy.descending = true; // Trigger descent for all
            }
        } else {
            // Descending logic: Move down a single row along the Z-axis
            const targetZ = this.originalPosition[2] + Enemy.descentRowOffset * Enemy.currentRow;
            this.position[2] += (targetZ - this.position[2]) * 0.1;

            // Snap to the row position when close enough
            if (Math.abs(this.position[2] - targetZ) < 0.01) {
                this.position[2] = targetZ; // Align to the row
            }
        }

        // Check if all enemies have finished descending
        if (Enemy.descending && Math.abs(this.position[2] - (this.originalPosition[2] + Enemy.descentRowOffset * Enemy.currentRow)) < 0.01) {
            Enemy.descending = false; // Stop descending once all enemies reach the same row
            Enemy.currentRow++; // Move to the next row for future descents
        }

        // Cycle appearance every 0.5 seconds
        this.cycleTime += deltaTime;
        if (this.cycleTime >= 0.5) {
            this.cycleAppearance();
            this.cycleTime = 0;
        }

        // Update the model matrix to reflect the new position
        super.update(deltaTime);
    }

    /**
     * Changes the enemy's appearance (e.g., color or scale).
     */
    cycleAppearance() {
        this.material.setUniform('uColor', [Math.random(), Math.random(), Math.random(), 1.0]); // Change color
    }

    destroy(scene) {
        super.destroy(scene); // Call the base class destroy method
        console.log('Enemy destroyed!');
    }
}
