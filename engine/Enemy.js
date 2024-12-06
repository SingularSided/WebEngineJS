import { Entity } from './Entity.js';

export class Enemy extends Entity {
    /**
     * Creates an enemy entity based on a 3D model.
     * @param {Object} objData - The loaded OBJ data for the enemy model.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     * @param {Material} material - The material to apply to the enemy.
     */
    constructor(objData, gl, material) {
        super(objData, gl, material);

        this.isDescending = false; // Whether the enemy is descending
        this.sinusoidalAmplitude = Math.random() * 0.5 + 0.5; // Random amplitude for descending movement
        this.originalPosition = [...this.position]; // Keep track of initial position
        this.direction = 1; // 1 for right, -1 for left
        this.marchSpeed = 2; // Horizontal movement speed
        this.descendSpeed = 2; // Descending speed
        this.cycleTime = 0; // Timer for cycling appearance
        this.targetPosition = [];
    }

    /**
     * Updates the enemy's position and appearance.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    update(deltaTime) {
        if (!this.isDescending) {
            // Move towards the target position
            const directionX = this.targetPosition[0] - this.position[0];
            const stepX = Math.sign(directionX) * this.marchSpeed * deltaTime;

            if (Math.abs(directionX) <= Math.abs(stepX)) {
                // Target reached; switch to the opposite side
                this.position[0] = this.targetPosition[0];
                this.targetPosition[0] = this.targetPosition[0] === 4 ? -4 : 4;
            } else {
                // Move closer to the target
                this.position[0] += stepX;
            }
        } else {
            // Descend steadily
            this.position[1] -= this.descendSpeed * deltaTime;

            // Reset when descending enemy goes off-screen
            if (this.position[1] < -5) {
                this.resetPosition();
            }
        }

        // Cycle appearance every 0.5 seconds
        this.cycleTime += deltaTime;
        if (this.cycleTime >= 0.5) {
            this.cycleAppearance(); // Change appearance logic
            this.cycleTime = 0;
        }

        // Update the model matrix to reflect new position
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
        //this.scale[0] = this.scale[0] === 1 ? 0.9 : 1; // Example: toggle scale slightly
        this.material.setUniform('uColor', [Math.random(), Math.random(), Math.random(), 1.0]); // Change color
    }
}
