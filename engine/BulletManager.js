import { Bullet } from './Bullet.js';

export class BulletManager {
    constructor() {
        this.bullets = []; // List of active bullets
    }

    /**
     * Creates a new bullet and adds it to the manager.
     * @param {Array<number>} position - Starting position of the bullet [x, y, z].
     * @param {Array<number>} direction - Direction the bullet is moving [x, y, z].
     * @param {number} speed - Speed of the bullet.
     * @param {Array<Entity>} ignoreList - Entities the bullet should ignore collisions with.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     * @returns {Bullet} - The newly created bullet.
     */
    createBullet(position, direction, speed, ignoreList, gl) {
        const material = this.createBulletMaterial(gl);
        const bulletData = {
            vertices: [
                -0.05, -0.05, 0,
                0.05, -0.05, 0,
                0.05, 0.05, 0,
                -0.05, 0.05, 0
            ],
            indices: [0, 1, 2, 2, 3, 0],
            normals: [],
            texCoords: []
        };

        const bullet = new Bullet(bulletData, gl, material);
        bullet.position = [...position];
        bullet.direction = [...direction];
        bullet.speed = speed;
        bullet.ignoreList = ignoreList;
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
            const outOfBounds = Math.abs(bullet.position[0]) > 50 || Math.abs(bullet.position[1]) > 50 || Math.abs(bullet.position[2]) > 50;
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

    /**
     * Creates a material for the bullet.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     * @returns {Material} - The bullet material.
     */
    createBulletMaterial(gl) {
        const vertexShaderSource = `
            attribute vec3 aPosition;
            uniform mat4 uModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;

            void main() {
                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.0);
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red bullet color
            }
        `;

        const material = new Material(gl, vertexShaderSource, fragmentShaderSource);
        return material;
    }
}
