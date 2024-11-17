import { Engine } from '../engine/Engine.js';
import { ObjLoader } from '../engine/ObjLoader.js';
import { Entity } from '../engine/Entity.js';

async function createObjEntity(url, gl) {
    const response = await fetch(url);
    const objData = ObjLoader.parse(await response.text());
    return new Entity(objData, gl);
}

async function main() {
    const engine = new Engine("webgl-canvas");
    engine.init();

    // Create and configure the cube entity
    const objEntity = await createObjEntity('./assets/cube.obj', engine.renderer.gl);
    objEntity.position = [0, 1, -5];
    objEntity.scale = [1, 1, 1];
    objEntity.rotation = [0, Math.PI / 4, 0];

    engine.scene.addEntity(objEntity);
    console.log('Vertices:', objEntity.vertices);
    console.log('Indices:', objEntity.indices);


    console.log("Cube Position:", objEntity.position);
    console.log("Cube Rotation:", objEntity.rotation);
    console.log("Cube Scale:", objEntity.scale);
    console.log("Vertices:", objEntity.vertices);
    console.log("Indices:", objEntity.indices);


    // Configure the camera
    const camera = engine.scene.camera;
    camera.position = [0, 2, 10]; // Ensure it's positioned behind and above the cube
    camera.target = [0, 1, 0];   // Point directly at the cube


    // Start the engine
    engine.start();


}

main();
