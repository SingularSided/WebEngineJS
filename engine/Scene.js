import { Camera } from "./Camera.js";

class Scene {
    constructor() {
        this.entities = []; // Array of all renderable entities
        this.camera = new Camera(); // The active camera
        this.lights = []; // Array of all lights in the scene
    }

    /**
     * Initialize the scene by updating the camera.
     * @param {Object} gl - The WebGL context.
     */
    init(gl) {
        this.camera.update(gl); // Initialize the camera matrices
    }

    /**
     * Add an entity to the scene.
     * @param {Entity} entity - The entity to add.
     */
    addEntity(entity) {
        this.entities.push(entity);
    }

    /**
     * Remove an entity from the scene.
     * @param {Entity} entity - The entity to remove.
     */
    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    /**
     * Add a light to the scene.
     * @param {Light} light - The light to add.
     */
    addLight(light) {
        this.lights.push(light);
    }

    /**
     * Remove a light from the scene.
     * @param {Light} light - The light to remove.
     */
    removeLight(light) {
        this.lights = this.lights.filter(l => l !== light);
    }

    /**
     * Update the scene by updating all entities, lights, and the camera.
     * @param {number} deltaTime - Time since the last update (in seconds).
     * @param {Object} input - Input handler for user controls.
     * @param {Object} canvas - The WebGL canvas for projection calculations.
     */
    update(deltaTime, input, canvas) {
        this.camera.update(canvas); // Update the camera for projection calculations
        this.entities.forEach(entity => entity.update(deltaTime));
        this.lights.forEach(light => light.update());
    }

    /**
     * Prepare lighting data for rendering.
     * This gathers light properties into an object that can be passed to the renderer.
     * @returns {Array} - Array of light data for the shader.
     */
    getLightData() {
        return this.lights.map(light => light.getLightData());
    }
}

export default Scene;
