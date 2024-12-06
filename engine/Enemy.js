import { Entity } from "./Entity.js";
import {BulletManager} from "./BulletManager.js";

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
        this.attackCooldown = 3.0; // Cooldown timer for shooting bullets
        this.targetPlayer = null; // Reference to the player entity
        this.scene = null; // Scene reference
        this.gl = null; // WebGL context
        this.hasLeftGroup = false; // Whether the enemy has left the group to target the player
    }

    /**
     * Sets the dependencies needed for the enemy's behavior.
     * @param {Object} config - Configuration object.
     * @param {Scene} config.scene - The scene to add bullets to.
     * @param {WebGLRenderingContext} config.gl - The WebGL context.
     */
    setDependencies({ scene, gl }) {
        this.scene = scene;
        this.gl = gl;
    }

    /**
     * Randomizes the horizontal movement bounds for the enemy.
     * @returns {number} - A random value between 3 and 5.
     */
    randomizeBounds() {
        return Math.random() * 2 + 3; // Random bounds between 3 and 5
    }

    /**
     * Updates the enemy's position and behavior.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    update(deltaTime) {
        if (this.targetPlayer) {
            this.cycleAppearance();


            // Behavior when targeting the player
            this.attackCooldown -= deltaTime;

            if (!this.hasLeftGroup) {
                console.log("Enemy is leaving the group to target the player.");
                this.hasLeftGroup = true; // Mark as left the group
            }

            const directionToPlayer = [
                this.targetPlayer.position[0] - this.position[0],
                this.targetPlayer.position[1] - this.position[1],
                this.targetPlayer.position[2] - this.position[2],
            ];

            const distanceToPlayer = Math.sqrt(
                directionToPlayer[0] ** 2 +
                directionToPlayer[1] ** 2 +
                directionToPlayer[2] ** 2
            );

            const normalizedDirection = directionToPlayer.map((d) => d / distanceToPlayer);

            this.position = this.position.map(
                (p, i) => p + normalizedDirection[i] * this.marchSpeed * deltaTime
            );

            console.log(this.attackCooldown);

            // Shoot at the player when cooldown expires
            if (this.attackCooldown <= 0 && this.scene && this.gl) {
                console.log("Enemy should be shooting.");
                this.shoot(normalizedDirection);
                this.attackCooldown = 3.0; // Reset cooldown
            }
        } else {
            // Regular group behavior handled in groupUpdate
        }

        // Update the model matrix for rendering
        super.update(deltaTime);

        // Handle appearance cycling
        // this.cycleTime += deltaTime;
        // if (this.cycleTime >= 0.5) {
        //     this.cycleAppearance();
        //     this.cycleTime = 0;
        // }
    }

    /**
     * Handles synchronized group behavior for all enemies.
     * @param {number} deltaTime - Time elapsed since the last update.
     * @param {Array<Enemy>} enemies - Array of all enemy instances.
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
                if (!enemy.targetPlayer) {
                    // Ensure grid alignment for descent
                    const targetPosZ = enemy.originalPosition[2] + targetZ;
                    enemy.position[2] += (targetPosZ - enemy.position[2]) * 0.1;

                    // Check if this enemy is aligned with the target row
                    if (Math.abs(enemy.position[2] - targetPosZ) > 0.01) {
                        allAligned = false;
                    }
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
                if (!enemy.targetPlayer) {
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
        }

        // Update individual enemies
        for (const enemy of enemies) {
            enemy.update(deltaTime);
        }
    }

    /**
     * Shoots a bullet in the specified direction.
     * @param {Array<number>} direction - The direction to shoot the bullet.
     */
    async shoot(direction) {
        const bulletPosition = [...this.position];
        bulletPosition[1] -= 0.5; // Slightly below the enemy

        const bullet = await BulletManager.getInstance().getBullet(bulletPosition, direction, 5.0, [this], this.gl);
        this.scene.addEntity(bullet);
        console.log("Enemy fired a bullet!");
    }

    /**
     * Changes the enemy's appearance (e.g., color or scale).
     */
    cycleAppearance() {
        this.scale = [0.8,0.8,0.8]
        this.material.setUniform("uColor", [Math.random(), Math.random(), Math.random(), 1.0]); // Change color
    }

    /**
     * Destroys the enemy and logs the action.
     * @param {Scene} scene - The scene to remove the enemy from.
     */
    destroy(scene) {
        super.destroy(scene); // Call the base class destroy method
        console.log("Enemy destroyed!");
    }
}
