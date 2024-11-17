export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl');
    }

    init() {
        const gl = this.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        console.log('Renderer initialized.');
    }

    render(scene) {
        const gl = this.gl;

        // Clear the screen
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Get the active camera
        const camera = scene.camera;

        // Get light data from the scene
        const lights = scene.getLightData();

        // Render all entities
        scene.entities.forEach(entity => {
            const material = entity.material;

            if (!material || !material.shaderProgram) {
                console.error("Entity is missing a material or its shader program is not compiled.");
                return;
            }

            // Use the material's shader program
            const shaderProgram = material.shaderProgram;
            gl.useProgram(shaderProgram);

            // Pass camera matrices
            const uViewMatrixLoc = material.uniformLocations['uViewMatrix'];
            const uProjectionMatrixLoc = material.uniformLocations['uProjectionMatrix'];

            if (uViewMatrixLoc) {
                gl.uniformMatrix4fv(uViewMatrixLoc, false, camera.getViewMatrix());
            }
            if (uProjectionMatrixLoc) {
                gl.uniformMatrix4fv(uProjectionMatrixLoc, false, camera.getProjectionMatrix());
            }

            // Pass light data to the shader
            lights.forEach((light, index) => {
                const lightBase = `uLights[${index}]`;

                const uLightPositionLoc = material.uniformLocations[`${lightBase}.position`];
                const uLightAmbientLoc = material.uniformLocations[`${lightBase}.ambient`];
                const uLightDiffuseLoc = material.uniformLocations[`${lightBase}.diffuse`];
                const uLightSpecularLoc = material.uniformLocations[`${lightBase}.specular`];

                if (uLightPositionLoc) {
                    console.log(`Setting position for light ${index}:`, light.position);
                    gl.uniform3fv(uLightPositionLoc, new Float32Array(light.position));
                }
                if (uLightAmbientLoc) {
                    console.log(`Setting ambient for light ${index}:`, light.ambient);
                    gl.uniform3fv(uLightAmbientLoc, new Float32Array(light.ambient));
                }
                if (uLightDiffuseLoc) {
                    console.log(`Setting diffuse for light ${index}:`, light.diffuse);
                    gl.uniform3fv(uLightDiffuseLoc, new Float32Array(light.diffuse));
                }
                if (uLightSpecularLoc) {
                    console.log(`Setting specular for light ${index}:`, light.specular);
                    gl.uniform3fv(uLightSpecularLoc, new Float32Array(light.specular));
                }
            });

            // Pass number of active lights
            const uNumLightsLoc = material.uniformLocations['uNumLights'];
            if (uNumLightsLoc) {
                console.log(`Setting uNumLights:`, lights.length);
                gl.uniform1i(uNumLightsLoc, lights.length);
            }

            // Apply material-specific uniforms
            material.applyUniforms();

            // Draw the entity
            entity.draw(gl, camera, scene);
        });
    }

}
