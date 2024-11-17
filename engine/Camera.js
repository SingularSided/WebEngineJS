import { mat4 } from '../node_modules/gl-matrix/esm/index.js';
import { Transformable } from './Transformable.js';

export class Camera extends Transformable {
    constructor() {
        super(); // Initialize Transformable properties (position, rotation, scale)
        this.viewMatrix = mat4.create(); // View matrix
        this.projectionMatrix = mat4.create(); // Projection matrix
        this.target = [0, 0, 0]; // Look-at target (default at origin)
        this.up = [0, 1, 0]; // Up direction
    }

    update(canvas) {
        // Calculate the view matrix using the camera's position, target, and up vector
        mat4.lookAt(this.viewMatrix, this.position, this.target, this.up);

        // Calculate the projection matrix
        mat4.perspective(
            this.projectionMatrix,
            Math.PI / 4, // 45-degree field of view
            canvas.width / canvas.height, // Aspect ratio from canvas
            0.1, // Near clipping plane
            100  // Far clipping plane
        );
    }

    getViewMatrix() {
        return this.viewMatrix;
    }

    getProjectionMatrix() {
        return this.projectionMatrix;
    }
}
