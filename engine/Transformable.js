import { vec3, mat4 } from '../node_modules/gl-matrix/esm/index.js';

export class Transformable {
    constructor() {
        this.position = vec3.fromValues(0, 0, 0);
        this.rotation = vec3.fromValues(0, 0, 0); // Euler angles
        this.scale = vec3.fromValues(1, 1, 1);
    }

    getModelMatrix() {
        const modelMatrix = mat4.create();

        // Apply transformations: Scale -> Rotate -> Translate
        mat4.translate(modelMatrix, modelMatrix, this.position);
        mat4.rotateX(modelMatrix, modelMatrix, this.rotation[0]);
        mat4.rotateY(modelMatrix, modelMatrix, this.rotation[1]);
        mat4.rotateZ(modelMatrix, modelMatrix, this.rotation[2]);
        mat4.scale(modelMatrix, modelMatrix, this.scale);

        return modelMatrix;
    }
}
