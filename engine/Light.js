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
        super(); // Position, rotation, scale from Transformable
        this.type = type; // Light type (e.g., "point", "directional", etc.)
        this.color = color; // RGB color of the light
        this.intensity = intensity; // Intensity multiplier
        this.ambient = 0.1; // Default ambient factor
        this.diffuse = 1.0; // Default diffuse factor
        this.specular = 1.0; // Default specular factor
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
            type: this.type, // Light type for shader logic
        };
    }

    /**
     * Updates light properties for animations or effects.
     * @param {number} deltaTime - Time elapsed since the last update.
     */
    update(deltaTime) {
        // Example: animate light intensity over time
        this.intensity = Math.abs(Math.sin(performance.now() / 1000)); // Oscillate intensity
    }


    /**
     * Updates the light's uniforms in the material.
     * @param {Material} material - The material to update.
     * @param {number} index - The index of the light in the shader's light array.
     */
    applyToMaterial(material, index = 0) {
        const baseName = `uLights[${index}]`;

        // Log uniform updates
        console.log(`Applying light ${index}:`, {
            position: this.position,
            color: this.color.map(c => c * this.intensity),
            ambient: this.ambient,
            diffuse: this.diffuse,
            specular: this.specular,
        });

        // Set all uniform data in the material
        material.setUniform(`${baseName}.position`, this.position);
        material.setUniform(`${baseName}.color`, this.color.map(c => c * this.intensity));
        material.setUniform(`${baseName}.ambient`, this.ambient);
        material.setUniform(`${baseName}.diffuse`, this.diffuse);
        material.setUniform(`${baseName}.specular`, this.specular);
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
