import { Engine } from '../engine/Engine.js';
import { ObjLoader } from '../engine/ObjLoader.js';
import { Entity } from '../engine/Entity.js';
import { Material } from '../engine/Material.js';
import { Light } from '../engine/Light.js';

/**
 * Creates an entity with a Blinn-Phong material applied.
 * @param {string} url - The URL to the OBJ file.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @returns {Entity} - The configured entity.
 */
async function createObjEntity(url, gl) {
    const response = await fetch(url);
    const objData = ObjLoader.parse(await response.text());

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

            vNormal = normalize(mat3(uModelMatrix) * aNormal);

            gl_Position = uProjectionMatrix * uViewMatrix * fragPos;
        }
    `;

    // Fragment shader for Blinn-Phong
    const fragmentShaderSource = `
        precision mediump float;

        struct Light {
            vec3 position;
            vec3 ambient;
            vec3 diffuse;
            vec3 specular;
        };

        uniform Light uLights[8]; // Support for up to 8 lights
        uniform int uNumLights;  // Number of active lights
        uniform vec3 uViewPos;   // Camera position

        varying vec3 vNormal;
        varying vec3 vFragPos;

        void main() {
            vec3 ambient = vec3(0.0);
            vec3 diffuse = vec3(0.0);
            vec3 specular = vec3(0.0);

            vec3 norm = normalize(vNormal);
            vec3 viewDir = normalize(uViewPos - vFragPos);

            // Accumulate lighting from all active lights
            for (int i = 0; i < 8; i++) {
                if (i >= uNumLights) break;

                // Light properties
                vec3 lightPos = uLights[i].position;
                vec3 lightAmbient = uLights[i].ambient;
                vec3 lightDiffuse = uLights[i].diffuse;
                vec3 lightSpecular = uLights[i].specular;

                // Ambient contribution
                ambient += lightAmbient;

                // Diffuse contribution
                vec3 lightDir = normalize(lightPos - vFragPos);
                float diff = max(dot(norm, lightDir), 0.0);
                diffuse += diff * lightDiffuse;

                // Specular contribution (Blinn-Phong)
                vec3 halfwayDir = normalize(lightDir + viewDir);
                float spec = pow(max(dot(norm, halfwayDir), 0.0), 32.0); // Shininess = 32
                specular += spec * lightSpecular;
            }

            vec3 result = ambient + diffuse + specular;
            gl_FragColor = vec4(result, 1.0);
        }
    `;

    // Create and compile the material
    const material = new Material(gl, vertexShaderSource, fragmentShaderSource);

    // Create the entity with the material
    const entity = new Entity(objData, gl, material);

    return entity;
}

/**
 * Main function to initialize the engine and render the scene.
 */
async function main() {
    const engine = new Engine("webgl-canvas");
    engine.init();

    const gl = engine.renderer.gl;

    // Configure the camera
    const camera = engine.scene.camera;
    camera.position = [0, 2, 10];
    camera.target = [0, 1, 0];

    // Add lights to the scene
    const light1 = new Light("point", [1.0, 0.8, 0.8], 1.0); // Warm light
    light1.position = [5.0, 5.0, 5.0];
    light1.ambient = [0.1, 0.1, 0.1];
    light1.diffuse = [1.0, 0.8, 0.8];
    light1.specular = [1.0, 0.8, 0.8];
    engine.scene.addLight(light1);

    const light2 = new Light("point", [0.8, 0.8, 1.0], 0.7); // Cool light
    light2.position = [-5.0, 5.0, -5.0];
    light2.ambient = [0.1, 0.1, 0.1];
    light2.diffuse = [0.8, 0.8, 1.0];
    light2.specular = [0.8, 0.8, 1.0];
    engine.scene.addLight(light2);

    // Create and configure the cube entity
    const objEntity = await createObjEntity('./assets/cube.obj', gl);
    objEntity.position = [0, 1, -5];
    objEntity.scale = [1, 1, 1];
    objEntity.rotation = [0, Math.PI / 4, 0];

    // Add the entity to the scene
    engine.scene.addEntity(objEntity);

    // Compile materials after adding the entity and lights
    objEntity.material.compile();

    // Set up static uniforms
    objEntity.material.setUniform('uViewPos', camera.position);

    // Log scene data for debugging
    console.log('Entities:', engine.scene.entities);
    console.log('Lights:', engine.scene.lights);

    // Start the engine
    engine.start();
}

main();
