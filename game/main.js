import { Engine } from '../engine/Engine.js';
import { ObjLoader } from '../engine/ObjLoader.js';
import { Entity } from '../engine/Entity.js';
import { Material } from '../engine/Material.js';

async function createObjEntity(url, gl) {
    const response = await fetch(url);
    const objData = ObjLoader.parse(await response.text());

    // Create the entity
    const entity = new Entity(objData, gl);

    // Vertex shader for Blinn-Phong
    const vertexShaderSource = `
        attribute vec3 aPosition;
        attribute vec3 aNormal;

        uniform mat4 uModelMatrix;
        uniform mat4 uViewMatrix;
        uniform mat4 uProjectionMatrix;

        varying vec3 vNormal;
        varying vec3 vFragPos;

        void main() {
            vec4 fragPos = uModelMatrix * vec4(aPosition, 1.0);
            vFragPos = fragPos.xyz;
            vNormal = mat3(uModelMatrix) * aNormal; // Transform the normal

            gl_Position = uProjectionMatrix * uViewMatrix * fragPos;
        }
    `;

    // Fragment shader for Blinn-Phong
    const fragmentShaderSource = `
        precision mediump float;

        struct Light {
            vec3 position;
            vec3 color;
        };

        uniform Light uLight;
        uniform vec3 uViewPos;

        varying vec3 vNormal;
        varying vec3 vFragPos;

        void main() {
            // Ambient lighting
            vec3 ambient = 0.1 * uLight.color;

            // Diffuse lighting
            vec3 norm = normalize(vNormal);
            vec3 lightDir = normalize(uLight.position - vFragPos);
            float diff = max(dot(norm, lightDir), 0.0);
            vec3 diffuse = diff * uLight.color;

            // Specular lighting (Blinn-Phong)
            vec3 viewDir = normalize(uViewPos - vFragPos);
            vec3 halfwayDir = normalize(lightDir + viewDir);
            float spec = pow(max(dot(norm, halfwayDir), 0.0), 32.0); // Shininess factor
            vec3 specular = spec * uLight.color;

            vec3 result = ambient + diffuse + specular;
            gl_FragColor = vec4(result, 1.0); // Final color
        }
    `;

    const material = new Material(gl, vertexShaderSource, fragmentShaderSource);
    material.compile();

    // Set uniform values
    material.setUniforms({
        'uLight.position': [5.0, 5.0, 5.0],
        'uLight.color': [1.0, 1.0, 1.0],
    });

    entity.material = material;
    return entity;
}

async function main() {
    const engine = new Engine("webgl-canvas");
    engine.init();

    const gl = engine.renderer.gl;

    // Create and configure the cube entity with the material
    const objEntity = await createObjEntity('./assets/cube.obj', gl);
    objEntity.position = [0, 1, -5];
    objEntity.scale = [1, 1, 1];
    objEntity.rotation = [0, Math.PI / 4, 0];

    engine.scene.addEntity(objEntity);

    console.log('Vertices:', objEntity.vertices);
    console.log('Indices:', objEntity.indices);
    console.log("Cube Position:", objEntity.position);
    console.log("Cube Rotation:", objEntity.rotation);
    console.log("Cube Scale:", objEntity.scale);

    // Configure the camera
    const camera = engine.scene.camera;
    camera.position = [0, 2, 10]; // Ensure it's positioned behind and above the cube
    camera.target = [0, 1, 0];   // Point directly at the cube

    // Set the dynamic uniform for the camera's position
    objEntity.material.setUniforms({
        uViewPos: camera.position,
    });

    // Start the engine
    engine.start();
}

main();
