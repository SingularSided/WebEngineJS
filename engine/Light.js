import { Transformable } from './Transformable.js';

/**
 * Represents a light source in the scene.
 */
export class Light extends Transformable {
    /**
     * Creates a light object.
     * @param {string} type - The type of light (e.g., "point", "directional", "spotlight").
     * @param {Array<number>} color - The RGB color of the light as an array [r, g, b].
     * @param {number} intensity - The intensity of the light (default is 1.0).
     */
    constructor(type = "point", color = [1.0, 1.0, 1.0], intensity = 1.0) {
        super(); // Inherits position, rotation, scale from Transformable
        this.type = type; // Light type (e.g., "point", "directional", "spotlight")
        this.color = color; // RGB color of the light
        this.intensity = intensity; // Intensity multiplier
        this.ambient = [0.1, 0.1, 0.1]; // Default ambient factor as [r, g, b]
        this.diffuse = [1.0, 1.0, 1.0]; // Default diffuse factor as [r, g, b]
        this.specular = [1.0, 1.0, 1.0]; // Default specular factor as [r, g, b]
    }

    /**
     * Returns light data formatted for use as uniforms in a shader.
     * @returns {Object} - An object with light properties for shader uniform updates.
     */
    getLightData() {
        return {
            position: this.position, // Light position in world space
            color: this.color.map(c => c * this.intensity), // Color modulated by intensity
            ambient: this.ambient, // Ambient factor
            diffuse: this.diffuse, // Diffuse factor
            specular: this.specular, // Specular factor
            type: this.type, // Light type for shader logic (not directly used here)
        };
    }

    /**
     * Updates light properties for animations or effects.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    update(deltaTime) {
        // Example: animate light intensity over time
        // Uncomment the below line to oscillate intensity for debugging or effects
        // this.intensity = Math.abs(Math.sin(performance.now() / 1000));
    }

    /**
     * Updates the light's uniforms in the material.
     * @param {Material} material - The material to update.
     * @param {number} index - The index of the light in the shader's light array.
     */
    applyToMaterial(material, index = 0) {
        const baseName = `uLights[${index}]`;

        // Set all relevant uniform data in the material
        material.setUniform(`${baseName}.position`, new Float32Array(this.position));
        material.setUniform(`${baseName}.ambient`, new Float32Array(this.ambient));
        material.setUniform(`${baseName}.diffuse`, new Float32Array(this.diffuse));
        material.setUniform(`${baseName}.specular`, new Float32Array(this.specular));
    }

    /**
     * Calculates the direction of the light based on its rotation.
     * Used for directional or spotlight types.
     * @returns {Array<number>} - Normalized direction vector.
     */
    getDirection() {
        const [x, y, z] = this.rotation;
        return [
            Math.cos(y) * Math.cos(x),
            Math.sin(x),
            Math.sin(y) * Math.cos(x),
        ];
    }
}
