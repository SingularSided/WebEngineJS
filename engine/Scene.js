import { Camera } from "./Camera.js";

class Scene {
    constructor() {
        this.entities = []; // All renderable entities
        this.camera = new Camera(); // The active camera
    }

    init(gl) {
        this.camera.update(gl); // Initialize the camera matrices
    }

    addEntity(entity) {
        this.entities.push(entity);
    }

    removeEntity(entity) {
        this.entities = this.entities.filter(e => e !== entity);
    }

    update(deltaTime, input, canvas) {
        this.camera.update(canvas); // Pass canvas for projection calculations
        this.entities.forEach(entity => entity.update(deltaTime));
    }

}

export default Scene;
