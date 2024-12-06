import { Entity } from "./Entity.js";
import { BulletManager } from "./BulletManager.js";

export class Enemy extends Entity {
    static direction = 1; // Shared horizontal direction (1 for right, -1 for left)
    static descending = false; // Whether all enemies are descending
    static descentRowOffset = 1.5; // Z-axis offset for each descent row
    static currentRow = 0; // Tracks the current descent row for all enemies
    static descentCooldown = 3.0; // Initial cooldown to delay the first descent

    constructor(objData, gl, material) {
        super(objData, gl, material);

        this.marchSpeed = 0.6; // Speed for marching
        this.originalPosition = [...this.position]; // Stores the initial position
        this.attackCooldown = 3.0; // Cooldown timer for shooting bullets
        this.targetPlayer = null; // Player being targeted
        this.scene = null; // Scene reference
        this.gl = null; // WebGL context
        this.canDescend = false; // Controls whether this enemy can descend
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
     * Updates the enemy's position and behavior.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    update(deltaTime) {
        if (this.targetPlayer) {
            // Targeting player behavior
            this.attackCooldown -= deltaTime;

            // Move toward the player
            const directionToPlayer = this.targetPlayer.position.map(
                (pos, i) => pos - this.position[i]
            );
            const distanceToPlayer = Math.hypot(...directionToPlayer);
            const normalizedDirection = directionToPlayer.map((d) => d / distanceToPlayer);

            this.position = this.position.map(
                (pos, i) => pos + normalizedDirection[i] * this.marchSpeed * deltaTime
            );

            // Shoot at the player when cooldown expires
            if (this.attackCooldown <= 0 && this.scene && this.gl) {
                this.shoot(normalizedDirection);
                this.attackCooldown = 3.0; // Reset cooldown
            }
        }

        // Update model matrix for rendering
        super.update(deltaTime);
    }

    /**
     * Handles synchronized group behavior for all enemies.
     * @param {number} deltaTime - Time elapsed since the last update.
     * @param {Array<Enemy>} enemies - Array of all enemy instances.
     */
    static groupUpdate(deltaTime, enemies) {
        // Check for descending logic
        if (!Enemy.descending && Enemy.descentCooldown <= 0) {
            Enemy.descending = true;
            Enemy.descentCooldown = 3.0; // Reset cooldown
        }

        if (Enemy.descending) {
            // Move all enemies with canDescend = true
            const targetZ = Enemy.currentRow * Enemy.descentRowOffset;
            let allAligned = true;

            for (const enemy of enemies) {
                if (enemy.canDescend && !enemy.targetPlayer) {
                    const targetPosZ = enemy.originalPosition[2] + targetZ;
                    enemy.position[2] += (targetPosZ - enemy.position[2]) * 0.1;

                    if (Math.abs(enemy.position[2] - targetPosZ) > 0.01) {
                        allAligned = false;
                    }
                }
            }

            // Stop descending if all are aligned
            if (allAligned) {
                Enemy.descending = false;
                Enemy.currentRow++;
            }
        } else {
            // Marching logic
            for (const enemy of enemies) {
                if (!enemy.targetPlayer) {
                    enemy.position[0] += Enemy.direction * enemy.marchSpeed * deltaTime;

                    // Reverse direction if bounds exceeded
                    if (Math.abs(enemy.position[0]) > 5) {
                        Enemy.direction *= -1; // Reverse direction
                    }
                }
            }
        }

        // Update each enemy
        for (const enemy of enemies) {
            enemy.update(deltaTime);
        }

        Enemy.descentCooldown -= deltaTime; // Update cooldown
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
    }

    /**
     * Changes the enemy's appearance (e.g., scales up briefly).
     */
    cycleAppearance() {
        this.scale = [Math.random() * 0.5 + 0.8, Math.random() * 0.5 + 0.8, Math.random() * 0.5 + 0.8];
    }

    /**
     * Destroys the enemy.
     * @param {Scene} scene - The scene to remove the enemy from.
     */
    destroy(scene) {
        super.destroy(scene);
        console.log("Enemy destroyed!");
    }
}
