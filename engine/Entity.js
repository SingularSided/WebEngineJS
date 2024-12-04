import { Transformable } from './Transformable.js';
import { mat4 } from '../node_modules/gl-matrix/esm/index.js';

/**
 * Represents a renderable entity in the scene.
 */
export class Entity extends Transformable {
    /**
     * Creates a renderable entity.
     * @param {Object} objData - The object data containing vertices, indices, normals, and texture coordinates.
     * @param {WebGLRenderingContext} gl - The WebGL context for buffer operations.
     * @param {Material} material - The material associated with this entity.
     */
    constructor(objData, gl, material) {
        super();
        this.vertices = objData.vertices;
        this.indices = objData.indices;
        this.normals = objData.normals;
        this.texCoords = objData.texCoords || []; // **Added:** Handle texture coordinates.

        console.log("Entity Vertices:", this.vertices);
        console.log("Entity Indices:", this.indices);
        console.log("Entity Normals:", this.normals);
        console.log("Entity Texture Coordinates:", this.texCoords);

        this.material = material;

        // Buffers for vertex attributes
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.normalBuffer = gl.createBuffer();
        this.texCoordBuffer = null;

        this.modelMatrix = mat4.create();

        // Upload vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        // Upload normal data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);

        // Upload index data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);

        // **Added:** Handle texture coordinates
        if (this.texCoords.length > 0) {
            this.texCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.texCoords), gl.STATIC_DRAW);
        }
    }

    /**
     * Updates the model matrix based on position, rotation, and scale.
     * @param {number} deltaTime - The time elapsed since the last update.
     */
    update(deltaTime) {
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
    }

    /**
     * Draws the entity using its material, camera, and scene lighting.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     * @param {Camera} camera - The active camera for the scene.
     * @param {Scene} scene - The scene containing lighting and other context.
     */
    draw(gl, camera, scene) {
        if (!this.material || !this.material.shaderProgram) {
            console.error("Entity is missing a material or its shader program is not compiled.");
            return;
        }

        const material = this.material;
        const shaderProgram = material.shaderProgram;

        gl.useProgram(shaderProgram);

        // Bind vertex buffer and set up position attribute
        const positionLoc = material.attributeLocations['aPosition'];
        if (positionLoc !== undefined) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(positionLoc);
        }

        // Bind normal buffer and set up normal attribute
        const normalLoc = material.attributeLocations['aNormal'];
        if (normalLoc !== undefined) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
            gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(normalLoc);
        }

        // **Added:** Bind texture coordinates buffer and set up texture attribute
        const texCoordLoc = material.attributeLocations['aTexCoord'];
        if (texCoordLoc !== undefined && this.texCoordBuffer) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
            gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(texCoordLoc);
        }

        // Bind index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Set uniforms for the model matrix
        const uModelMatrixLoc = material.uniformLocations['uModelMatrix'];
        if (uModelMatrixLoc) {
            gl.uniformMatrix4fv(uModelMatrixLoc, false, this.modelMatrix);
        }

        // Pass view and projection matrices to the material
        material.setUniform('uViewMatrix', camera.getViewMatrix());
        material.setUniform('uProjectionMatrix', camera.getProjectionMatrix());

        // Apply lights to the material
        scene.applyLightsToMaterial(material);

        // Apply material uniforms (e.g., texture samplers, lighting data)
        material.applyUniforms();

        console.log("Drawing entity with:");
        console.log("Model Matrix:", this.modelMatrix);
        console.log("View Matrix:", camera.getViewMatrix());
        console.log("Projection Matrix:", camera.getProjectionMatrix());
        console.log("Number of indices:", this.indices.length);

        // Draw the entity
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}
