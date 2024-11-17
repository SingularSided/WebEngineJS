import { Transformable } from './Transformable.js';
import { mat4 } from '../node_modules/gl-matrix/esm/index.js';

export class Entity extends Transformable {
    constructor(objData, gl) {
        super();
        this.vertices = objData.vertices;
        this.indices = objData.indices;

        console.log("Entity Vertices:", this.vertices);
        console.log("Entity Indices:", this.indices);

        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();
        this.position = [0, 0, 0]; // Default position
        this.rotation = [0, 0, 0]; // Default rotation
        this.scale = [1, 1, 1];   // Default scale
        this.modelMatrix = mat4.create(); // Initialize model matrix

        // Upload vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        // Upload index data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
    }

    update(deltaTime) {
        // Recompute the model matrix
        mat4.identity(this.modelMatrix);
        mat4.translate(this.modelMatrix, this.modelMatrix, this.position);
        mat4.rotateX(this.modelMatrix, this.modelMatrix, this.rotation[0]);
        mat4.rotateY(this.modelMatrix, this.modelMatrix, this.rotation[1]);
        mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.rotation[2]);
        mat4.scale(this.modelMatrix, this.modelMatrix, this.scale);
    }

    draw(gl, shaderProgram, camera) {
        // Get attribute and uniform locations
        const positionAttribLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
        if (positionAttribLocation === -1) {
            console.error("Attribute 'aPosition' not found in shader program.");
            return;
        }
        console.log('aPosition location:', positionAttribLocation);

        const uModelMatrixLoc = gl.getUniformLocation(shaderProgram, 'uModelMatrix');
        const uViewMatrixLoc = gl.getUniformLocation(shaderProgram, 'uViewMatrix');
        const uProjectionMatrixLoc = gl.getUniformLocation(shaderProgram, 'uProjectionMatrix');

        if (!uModelMatrixLoc || !uViewMatrixLoc || !uProjectionMatrixLoc) {
            console.error(
                "Uniforms 'uModelMatrix', 'uViewMatrix', or 'uProjectionMatrix' not found in shader program."
            );
            return;
        }

        console.log('uModelMatrix location:', uModelMatrixLoc);
        console.log('uViewMatrix location:', uViewMatrixLoc);
        console.log('uProjectionMatrix location:', uProjectionMatrixLoc);

        // Compute matrices
        const modelMatrix = this.getModelMatrix();
        const viewMatrix = camera.getViewMatrix();
        const projectionMatrix = camera.getProjectionMatrix();

        // Bind vertex data
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionAttribLocation);

        // Bind index data
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // Pass matrices to the shader
        gl.uniformMatrix4fv(uModelMatrixLoc, false, modelMatrix);
        gl.uniformMatrix4fv(uViewMatrixLoc, false, viewMatrix);
        gl.uniformMatrix4fv(uProjectionMatrixLoc, false, projectionMatrix);

        // Debugging output for matrices
        console.log("Drawing entity with:");
        console.log("Model Matrix:", modelMatrix);
        console.log("View Matrix:", viewMatrix);
        console.log("Projection Matrix:", projectionMatrix);
        console.log("Number of indices:", this.indices.length);

        // Draw the entity
        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_SHORT, 0);
    }


}
