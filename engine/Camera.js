import { mat4, vec3 } from '../node_modules/gl-matrix/esm/index.js';

export class Camera {
    constructor() {
        this.position = [0, 0, 0]; // Camera position
        this.lookAt = [0, 0, -1]; // Look-at direction (default: forward)
        this.up = [0, 1, 0]; // Up direction (default: world up)
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
    }

    /**
     * Updates the view matrix based on the camera's position and look-at vector.
     */
    updateViewMatrix() {
        // Calculate the target position based on the lookAt vector and position
        const target = vec3.add(vec3.create(), this.position, this.lookAt);

        // Create the view matrix using lookAt transformation
        mat4.lookAt(this.viewMatrix, this.position, target, this.up);
    }

    /**
     * Configures the perspective projection matrix.
     * @param {HTMLCanvasElement} canvas - The canvas to get the aspect ratio.
     */
    updateProjectionMatrix(canvas) {
        mat4.perspective(
            this.projectionMatrix,
            Math.PI / 4, // 45-degree field of view
            canvas.width / canvas.height, // Aspect ratio
            0.1, // Near clipping plane
            100  // Far clipping plane
        );
    }

    /**
     * Updates the camera matrices (view and projection).
     * @param {HTMLCanvasElement} canvas - The canvas to get the aspect ratio.
     */
    update(canvas) {
        this.updateViewMatrix();
        this.updateProjectionMatrix(canvas);
    }

    /**
     * Returns the current view matrix.
     * @returns {mat4}
     */
    getViewMatrix() {
        return this.viewMatrix;
    }

    /**
     * Returns the current projection matrix.
     * @returns {mat4}
     */
    getProjectionMatrix() {
        return this.projectionMatrix;
    }
}
