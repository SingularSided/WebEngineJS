import { Entity } from './Entity.js';

export class Player extends Entity {
    constructor(position) {
        super(position);
        this.speed = 0.1;
    }

    handleInput(input) {
        if (input.isKeyPressed('ArrowLeft')) {
            this.position[0] -= this.speed;
        }
        if (input.isKeyPressed('ArrowRight')) {
            this.position[0] += this.speed;
        }
    }
}

export class Enemy extends Entity {
    constructor(position) {
        super(position);
        this.velocity = [0, -0.05, 0]; // Move downward
    }

    update(deltaTime) {
        super.update(deltaTime);
        // Additional enemy-specific logic here
    }
}
