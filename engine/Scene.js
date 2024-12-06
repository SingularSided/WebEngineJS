import { Camera } from "./Camera.js";

/**
 * Represents a scene containing entities, lights, and a camera.
 */
class Scene {
    constructor() {
        this.entities = []; // Array of all renderable entities
        this.lights = []; // Array of all lights in the scene
        this.camera = new Camera(); // The active camera
    }

    /**
     * Initializes the scene, ensuring the camera is set up.
     * @param {HTMLCanvasElement} canvas - The canvas used for rendering.
     */
    init(canvas) {
        this.camera.update(canvas); // Initialize the camera matrices
    }

    /**
     * Adds an entity to the scene.
     * @param {Entity} entity - The entity to add.
     */
    addEntity(entity) {
        this.entities.push(entity);
    }

    /**
     * Removes an entity from the scene.
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }

    /**
     * Adds a light to the scene.
     * @param {Light} light - The light to add.
     */
    addLight(light) {
        this.lights.push(light);
    }

    /**
     * Removes a light from the scene.
     * @param {Light} light - The light to remove.
     */
    removeLight(light) {
        this.lights = this.lights.filter(l => l !== light);
    }

    /**
     * Updates all entities, lights, and the camera in the scene.
     * @param {number} deltaTime - Time since the last update (in seconds).
     * @param {Object} input - Input handler for user controls.
     * @param {HTMLCanvasElement} canvas - The canvas used for rendering.
     */
    update(deltaTime, input, canvas) {
        this.camera.update(canvas);
        this.entities.forEach(entity => entity.update(deltaTime));
        this.lights.forEach(light => light.update());
    }

    /**
     * Prepares light data and applies it to a material.
     * @param {Material} material - The material to update with light data.
     */
    applyLightsToMaterial(material) {
        this.lights.forEach((light, index) => {
            if (index >= 8) {
                console.warn("Maximum light limit (8) reached.");
                return;
            }
            light.applyToMaterial(material, index);
        });

        // Inform the shader how many lights are active
        material.setUniform('uNumLights', this.lights.length);
    }


    /**
     * Prepares light data for rendering.
     * This gathers light properties into an array of objects for use in shaders.
     * @returns {Array<Object>} - Array of light data objects.
     */
    getLightData() {
        return this.lights.map(light => light.getLightData());
    }

}

export default Scene;
