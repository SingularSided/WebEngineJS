import { mat4, vec3 } from '../node_modules/gl-matrix/esm/index.js';

export class Camera {
    constructor() {
        this.position = [0, 10, 0]; // Default position (above the scene)
        this.lookAt = [0, -1, 0]; // Default look direction (downward)
        this.up = [0, 0, -1]; // Default up direction for the camera
        this.viewMatrix = mat4.create();
        this.projectionMatrix = mat4.create();
    }

    /**
     * Updates the view matrix using position, lookAt direction, and up vector.
     */
    updateViewMatrix() {
        // Calculate the target position using the lookAt vector
        const target = vec3.add(vec3.create(), this.position, this.lookAt);

        // Construct the view matrix
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
            1000  // Far clipping plane
        );
    }

    /**
     * Updates the camera's matrices (view and projection).
     * @param {HTMLCanvasElement} canvas - The canvas to get the aspect ratio.
     */
    update(canvas) {
        this.updateViewMatrix();
        this.updateProjectionMatrix(canvas);
    }

    /**
     * Returns the view matrix.
     * @returns {mat4}
     */
    getViewMatrix() {
        return this.viewMatrix;
    }

    /**
     * Returns the projection matrix.
     * @returns {mat4}
     */
    getProjectionMatrix() {
        return this.projectionMatrix;
    }

    /**
     * Points the camera directly at a specific target position.
     * @param {Array<number>} target - The [x, y, z] coordinates of the target.
     */
    lookAtTarget(target) {
        vec3.subtract(this.lookAt, target, this.position); // Calculate direction
        vec3.normalize(this.lookAt, this.lookAt); // Normalize to a unit vector
    }

    /**
     * Sets the camera's position and aligns it to look at a specific target.
     * @param {Array<number>} position - The new camera position.
     * @param {Array<number>} target - The [x, y, z] coordinates of the target.
     */
    setPositionAndLookAt(position, target) {
        this.position = position;
        this.lookAtTarget(target); // Update lookAt based on the target
    }
}
