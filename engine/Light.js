import { Transformable } from './Transformable.js';

/**
 * The Light class represents a light source in the scene.
 * It extends Transformable to inherit position, rotation, and scale properties.
 */
export class Light extends Transformable {
    /**
     * @param {string} type - The type of light (e.g., "point", "directional").
     * @param {Array} color - RGB color of the light as an array [r, g, b].
     * @param {number} intensity - Intensity of the light (default is 1.0).
     */
    constructor(type = "point", color = [1.0, 1.0, 1.0], intensity = 1.0) {
        super();
        this.type = type; // Light type (e.g., point, directional)
        this.color = color; // Light color
        this.intensity = intensity; // Light intensity
    }

    /**
     * Updates the light's uniform data in the material.
     * @param {Material} material - The material to update with this light's properties.
     * @param {number} index - The index of this light (for arrays in shaders).
     */
    update(material, index = 0) {
        if (!material) {
            console.error("No material provided for Light update.");
            return;
        }

        const baseName = `uLights[${index}]`;

        // Update position (world-space)
        material.setUniform(`${baseName}.position`, this.position);

        // Update color (modulated by intensity)
        const modulatedColor = this.color.map(c => c * this.intensity);
        material.setUniform(`${baseName}.color`, modulatedColor);

        // Update type if applicable
        if (this.type === "directional") {
            material.setUniform(`${baseName}.direction`, this.getDirection());
        }
    }

    /**
     * Calculates the direction of the light based on its rotation.
     * Used primarily for directional or spotlight types.
     * @returns {Array} - Normalized direction vector.
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
