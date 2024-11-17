export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl');
    }

    /**
     * Initializes the renderer by setting up the WebGL context.
     */
    init() {
        const gl = this.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        console.log('Renderer initialized.');
    }

    /**
     * Renders the scene, including entities and lights.
     * @param {Scene} scene - The scene to render.
     */
    render(scene) {
        const gl = this.gl;

        // Clear the canvas and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Update the camera matrices
        const camera = scene.camera;

        // Render each entity
        scene.entities.forEach(entity => {
            const material = entity.material;

            if (!material || !material.shaderProgram) {
                console.error("Entity missing material or uncompiled shader program.");
                return;
            }

            // Use the material's shader program
            const shaderProgram = material.shaderProgram;
            gl.useProgram(shaderProgram);

            // Set the camera's view and projection matrices
            const uViewMatrixLoc = material.uniformLocations['uViewMatrix'];
            const uProjectionMatrixLoc = material.uniformLocations['uProjectionMatrix'];

            if (uViewMatrixLoc) {
                gl.uniformMatrix4fv(uViewMatrixLoc, false, camera.getViewMatrix());
            }
            if (uProjectionMatrixLoc) {
                gl.uniformMatrix4fv(uProjectionMatrixLoc, false, camera.getProjectionMatrix());
            }

            // Pass light data to the shader
            const lights = scene.lights;
            lights.forEach((light, index) => {
                const lightBase = `uLights[${index}]`;

                const uLightPositionLoc = material.uniformLocations[`${lightBase}.position`];
                const uLightColorLoc = material.uniformLocations[`${lightBase}.color`];
                const uLightTypeLoc = material.uniformLocations[`${lightBase}.type`];

                if (uLightPositionLoc) {
                    gl.uniform3fv(uLightPositionLoc, light.position);
                }
                if (uLightColorLoc) {
                    gl.uniform3fv(uLightColorLoc, light.color.map(c => c * light.intensity));
                }
                if (uLightTypeLoc) {
                    gl.uniform1i(uLightTypeLoc, light.type === 'directional' ? 1 : 0); // Example: 1 for directional, 0 for point
                }
            });

            // Update any additional uniforms from the material
            material.applyUniforms();

            // Draw the entity
            entity.draw(gl, camera);
        });
    }
}
