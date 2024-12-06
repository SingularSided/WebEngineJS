import { Entity } from "./Entity.js";

export class Enemy extends Entity {
    static marchDirection = 1; // Shared direction of movement (1 for right, -1 for left)
    static timeSinceDirectionChange = 0; // Shared time counter for direction changes

    /**
     * Creates an enemy entity based on a 3D model.
     * @param {Object} objData - The loaded OBJ data for the enemy model.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     * @param {Material} material - The material to apply to the enemy.
     */
    constructor(objData, gl, material) {
        super(objData, gl, material);

        this.isAttacking = false; // Whether the enemy is attacking the player
        this.attackSpeed = 4; // Speed when attacking
        this.returnSpeed = 2; // Speed when returning to the grid
        this.marchSpeed = 2; // Speed of grid movement
        this.gridBounds = 4; // Horizontal bounds for grid movement
        this.cycleTime = 0; // Timer for cycling appearance
        this.originalPosition = [...this.position]; // Store the initial grid position
        this.targetPlayer = null; // Optional: Target player for attack
    }

    /**
     * Updates the enemy's position and behavior.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    update(deltaTime) {
        if (!this.isAttacking) {
            // Update shared direction change timer
            Enemy.timeSinceDirectionChange += deltaTime;

            // Change direction for all enemies when bounds are hit or after a fixed interval
            if (
                this.originalPosition[0] + Enemy.marchDirection * this.marchSpeed * deltaTime > this.gridBounds ||
                this.originalPosition[0] + Enemy.marchDirection * this.marchSpeed * deltaTime < -this.gridBounds
            ) {
                Enemy.marchDirection *= -1; // Reverse direction
                Enemy.timeSinceDirectionChange = 0; // Reset the shared timer
            }

            // Apply grid movement
            this.originalPosition[0] += Enemy.marchDirection * this.marchSpeed * deltaTime;
            this.position[0] = this.originalPosition[0];
            this.position[1] = this.originalPosition[1];

            // Occasionally initiate an attack
            if (Math.random() < 0.001 && this.targetPlayer) {
                this.isAttacking = true;
            }
        } else {
            // Attack the player
            const direction = [
                this.targetPlayer.position[0] - this.position[0],
                this.targetPlayer.position[1] - this.position[1],
                this.targetPlayer.position[2] - this.position[2],
            ];
            const distance = Math.sqrt(direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2);

            if (distance > 0.1) {
                const normalizedDirection = direction.map((d) => d / distance);
                this.position = this.position.map(
                    (p, i) => p + normalizedDirection[i] * this.attackSpeed * deltaTime
                );
            } else {
                // Return to the grid after reaching the player
                this.isAttacking = false;
            }
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
}
