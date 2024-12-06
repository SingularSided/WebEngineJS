import { Entity } from './Entity.js';

export class Player extends Entity {
    /**
     * Creates a player entity based on a 3D model.
     * @param {Object} objData - The loaded OBJ data for the player model.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     * @param {Material} material - The material to apply to the player.
     */
    constructor(objData, gl, material) {
        super(objData, gl, material);

        this.position = [0, -3, -10]; // Initial position
        this.speed = 5; // Speed of movement
        this.boundary = { left: -4, right: 4 }; // Movement boundaries
        this.rotationSpeed = 2; // Rotation speed for animation
    }

    /**
     * Handles input for player movement.
     * @param {Object} input - Input handler instance.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    handleInput(input, deltaTime) {
        const moveDistance = this.speed * deltaTime;

        // Move left
        if (input.isKeyPressed('ArrowLeft')) {
            this.position[0] -= moveDistance;
            this.rotation[2] = Math.PI / 10; // Tilt left for animation
        }

        // Move right
        if (input.isKeyPressed('ArrowRight')) {
            this.position[0] += moveDistance;
            this.rotation[2] = -Math.PI / 10; // Tilt right for animation
        }

        // // Move up
        // if (input.isKeyPressed('ArrowUp')) {
        //     this.position[1] += moveDistance;
        // }
        //
        // // Move down
        // if (input.isKeyPressed('ArrowDown')) {
        //     this.position[1] -= moveDistance;
        // }

        // Stop tilting when no input
        if (!input.isKeyPressed('ArrowLeft') && !input.isKeyPressed('ArrowRight')) {
            this.rotation[2] = 0;
        }

        // Clamp position within boundaries
        this.position[0] = Math.max(this.boundary.left, Math.min(this.boundary.right, this.position[0]));

        // Update the transformation matrix
        this.update();
    }

    /**
     * Animates the player (e.g., add subtle motion when idle).
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    animate(deltaTime) {
        // Apply a subtle idle "bobbing" effect when idle
        this.rotation[1] += this.rotationSpeed * deltaTime;
        this.update();
    }

    destroy(scene) {
        super.destroy(scene); // Call the base class destroy method
        console.log('Player destroyed! Game Over!');
        // Additional logic for ending the game
        //alert('Game Over!');
    }
}
