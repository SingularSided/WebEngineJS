import {Entity} from "./Entity.js";

export class Enemy extends Entity {
    /**
     * Creates an enemy entity based on a 3D model.
     * @param {Object} objData - The loaded OBJ data for the enemy model.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     * @param {Material} material - The material to apply to the enemy.
     */
    constructor(objData, gl, material) {
        super(objData, gl, material);

        this.targetPlayer = null; // Reference to the player, optional
        this.isDescending = false; // Whether the enemy is descending
        this.marchSpeed = 2; // Movement speed
        this.targetPosition = [0, 0, 0]; // Initial target position
        this.cycleTime = 0; // Timer for cycling appearance
    }

    /**
     * Updates the enemy's position and appearance.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    update(deltaTime) {
        if (this.targetPlayer) {
            // Set target position to the player's position
            this.targetPosition = [...this.targetPlayer.position];
        } else if (!this.isDescending) {
            // Default marching logic (left and right)
            if (this.position[0] === this.targetPosition[0]) {
                this.targetPosition[0] = this.targetPosition[0] === 4 ? -4 : 4; // Switch to the other side
            }
        } else {
            // Default descending logic
            this.targetPosition[1] = -5; // Move downward
        }

        // Move toward the target position
        const direction = [
            this.targetPosition[0] - this.position[0],
            this.targetPosition[1] - this.position[1],
            this.targetPosition[2] - this.position[2],
        ];
        const distance = Math.sqrt(direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2);

        // Normalize direction and scale by speed
        if (distance > 0.01) {
            const normalizedDirection = direction.map((d) => d / distance);
            this.position = this.position.map(
                (p, i) => p + normalizedDirection[i] * this.marchSpeed * deltaTime
            );
        }

        // Reset when descending enemy goes off-screen
        if (this.isDescending && this.position[1] < -5) {
            this.resetPosition();
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
     * Resets the enemy's position and state when it descends off-screen.
     */
    resetPosition() {
        this.isDescending = false; // Stop descending
        this.position[1] = 2; // Reset Y position
        this.position[0] = Math.random() * 8 - 4; // Randomize X position
        this.targetPosition[0] = this.position[0] > 0 ? -4 : 4; // Reset target to the opposite direction
    }

    /**
     * Initializes the enemy's marching logic.
     */
    initializeMarch() {
        this.targetPosition = [this.position[0] > 0 ? -4 : 4, this.position[1], this.position[2]];
    }

    /**
     * Changes the enemy's appearance (e.g., color or scale).
     */
    cycleAppearance() {
        this.material.setUniform('uColor', [Math.random(), Math.random(), Math.random(), 1.0]); // Change color
    }
}
