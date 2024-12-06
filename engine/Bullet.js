import { Entity } from './Entity.js';

export class Bullet extends Entity {
    constructor(objData, gl, material, direction, speed, ignoreList) {
        super(objData, gl, material);

        this.direction = direction; // The direction the bullet travels
        this.speed = speed; // Speed of the bullet
        this.ignoreList = ignoreList; // Entities to ignore
        this.lifetime = 5; // Lifetime of the bullet in seconds
        this.age = 0; // Current age of the bullet
    }

    /**
     * Updates the bullet's position and checks if it exceeds its lifetime.
     * @param {number} deltaTime - The time elapsed since the last update.
     */
    update(deltaTime) {
        // Move the bullet
        this.position = this.position.map(
            (p, i) => p + this.direction[i] * this.speed * deltaTime
        );

        // Increment age and check lifetime
        this.age += deltaTime;
        if (this.age >= this.lifetime) {
            this.isDestroyed = true;
        }

        // Update the model matrix to reflect the new position
        super.update(deltaTime);
    }
}
