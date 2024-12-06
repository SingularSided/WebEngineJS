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
    }

    /**
     * Updates the enemy's position and appearance.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    update(deltaTime) {
        if (!this.isDescending) {
            // March left and right
            this.position[0] += this.direction * this.marchSpeed * deltaTime;

            // Reverse direction if boundaries are reached
            if (this.position[0] > 4 || this.position[0] < -4) {
                this.direction *= -1;
            }
        } else {
            // Descend in a sinusoidal pattern
            this.position[0] += Math.sin(this.position[1]) * this.sinusoidalAmplitude;
            this.position[1] -= this.descendSpeed * deltaTime;
        }

        // Cycle appearance every 0.5 seconds
        this.cycleTime += deltaTime;
        if (this.cycleTime >= 0.5) {
            this.cycleAppearance();
            this.cycleTime = 0;
        }

        this.updateModelMatrix();
    }

    /**
     * Changes the enemy's appearance (e.g., color or scale).
     */
    cycleAppearance() {
        this.scale[0] = this.scale[0] === 1 ? 0.9 : 1; // Example: toggle scale slightly
        this.material.setUniform('uColor', [Math.random(), Math.random(), Math.random(), 1.0]); // Change color
    }
}
