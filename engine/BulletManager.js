import { createBullet } from './Factory.js';

export class BulletManager {
    static instance = null; // Singleton instance

    constructor() {
        if (BulletManager.instance) {
            return BulletManager.instance; // Return existing instance if it exists
        }
        this.bullets = []; // Instance-based bullets array
        BulletManager.instance = this; // Set this as the singleton instance
    }

    /**
     * Creates or fetches the singleton instance.
     * @returns {BulletManager} - The singleton instance of BulletManager.
     */
    static getInstance() {
        if (!BulletManager.instance) {
            new BulletManager(); // Initialize instance if not created yet
        }
        return BulletManager.instance;
    }

    /**
     * Creates a new bullet and adds it to the manager.
     * @param {Array<number>} position - Starting position of the bullet [x, y, z].
     * @param {Array<number>} direction - Direction the bullet is moving [x, y, z].
     * @param {number} speed - Speed of the bullet.
     * @param {Array<Entity>} ignoreList - Entities the bullet should ignore collisions with.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     * @returns {Promise<Bullet>} - The newly created bullet.
     */
    async getBullet(position, direction, speed, ignoreList, gl) {
        const bullet = await createBullet(position, direction, speed, ignoreList, gl);
        this.bullets.push(bullet);
        return bullet;
    }

    /**
     * Updates all bullets in the manager.
     * @param {number} deltaTime - Time elapsed since the last frame.
     * @param {Scene} scene - The scene to manage the bullets in.
     */
    update(deltaTime, scene) {
        this.bullets.forEach((bullet) => bullet.update(deltaTime));

        // Remove bullets that are destroyed or out of bounds
        this.bullets = this.bullets.filter((bullet) => {
            const outOfBounds =
                Math.abs(bullet.position[0]) > 50 ||
                Math.abs(bullet.position[1]) > 50 ||
                Math.abs(bullet.position[2]) > 50;
            if (bullet.isDestroyed || outOfBounds) {
                scene.removeEntity(bullet);
                bullet.destroy(scene);
                return false;
            }
            return true;
        });
    }

    /**
     * Checks for collisions between bullets and a list of entities.
     * @param {Array<Entity>} targets - List of potential targets for collision.
     * @param {Scene} scene - The scene to remove entities upon collision.
     * @param {Function} onCollision - Callback for when a collision is detected (bullet, target).
     */
    checkCollisions(targets, scene, onCollision) {
        this.bullets.forEach((bullet) => {
            if (bullet.isDestroyed) return;

            targets.forEach((target) => {
                if (target.isDestroyed || bullet.ignoreList.includes(target)) return;

                const distance = Math.sqrt(
                    Math.pow(bullet.position[0] - target.position[0], 2) +
                    Math.pow(bullet.position[1] - target.position[1], 2) +
                    Math.pow(bullet.position[2] - target.position[2], 2)
                );

                if (distance < 1.0) { // Example collision radius
                    onCollision(bullet, target);
                }
            });
        });
    }
}
