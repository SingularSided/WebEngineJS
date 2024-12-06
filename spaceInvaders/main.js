import { Engine } from '../engine/Engine.js';
import { ObjLoader } from '../engine/ObjLoader.js';
import { Entity } from '../engine/Entity.js';
import { Material } from '../engine/Material.js';
import { Light } from '../engine/Light.js';
import {Player} from "../engine/Player.js";

const vertexShaderSource =
`
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord; // Texture coordinate attribute
    
    uniform mat4 uModelMatrix;
    uniform mat4 uViewMatrix;
    uniform mat4 uProjectionMatrix;
    
    varying vec3 vNormal;
    varying vec3 vFragPos;
    varying vec2 vTexCoord;
    
    void main() {
        vec4 fragPos = uModelMatrix * vec4(aPosition, 1.0);
        vFragPos = fragPos.xyz;
    
        vNormal = normalize(mat3(uModelMatrix) * aNormal);
        vTexCoord = aTexCoord; // Pass texture coordinate
    
        gl_Position = uProjectionMatrix * uViewMatrix * fragPos;
    }
`;

const fragmentShaderSource =
`
    precision mediump float;
    
    struct Light {
        vec3 position;
        vec3 ambient;
        vec3 diffuse;
        vec3 specular;
    };
    
    uniform Light uLights[8];
    uniform int uNumLights;
    uniform vec3 uViewPos;
    uniform sampler2D uTexture; // Texture uniform
    
    varying vec3 vNormal;
    varying vec3 vFragPos;
    varying vec2 vTexCoord; // Interpolated texture coordinate
    
    void main() {
        vec3 ambient = vec3(0.0);
        vec3 diffuse = vec3(0.0);
        vec3 specular = vec3(0.0);
    
        vec3 norm = normalize(vNormal);
        vec3 viewDir = normalize(uViewPos - vFragPos);
    
        // Accumulate lighting from all active lights
        for (int i = 0; i < 8; i++) {
            if (i >= uNumLights) break;
    
            vec3 lightPos = uLights[i].position;
            vec3 lightAmbient = uLights[i].ambient;
            vec3 lightDiffuse = uLights[i].diffuse;
            vec3 lightSpecular = uLights[i].specular;
    
            ambient += lightAmbient;
    
            vec3 lightDir = normalize(lightPos - vFragPos);
            float diff = max(dot(norm, lightDir), 0.0);
            diffuse += diff * lightDiffuse;
    
            vec3 halfwayDir = normalize(lightDir + viewDir);
            float spec = pow(max(dot(norm, halfwayDir), 0.0), 32.0);
            specular += spec * lightSpecular;
        }
    
        // Sample the texture
        vec4 texColor = texture2D(uTexture, vTexCoord);
    
        // Combine texture color with lighting
        vec3 result = texColor.rgb * (ambient + diffuse) + specular;
        gl_FragColor = vec4(result, texColor.a);
    }

`;


/**
 * Creates an entity with a Blinn-Phong material and a texture applied.
 * @param {string} objUrl - The URL to the OBJ file.
 * @param {string} textureUrl - The URL to the texture image.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @returns {Entity} - The configured entity.
 */
async function createObjEntityWithTexture(objUrl, textureUrl, gl) {
    const response = await fetch(objUrl);
    const objData = ObjLoader.parse(await response.text());


    // Create and compile the material
    const material = new Material(gl, vertexShaderSource, fragmentShaderSource);
    await material.addTexture(textureUrl, 'uTexture'); // Load texture and bind it to 'uTexture'

    // Create the entity with the material
    const entity = new Entity(objData, gl, material);

    return entity;
}

/**
 * Creates a player entity with a Blinn-Phong material and a texture applied.
 * The player can move left and right using arrow keys.
 *
 * @param {string} objUrl - The URL to the OBJ file for the player model.
 * @param {string} textureUrl - The URL to the texture image for the player.
 * @param {WebGLRenderingContext} gl - The WebGL context.
 * @returns {Player} - The configured player entity.
 */
async function createPlayer(objUrl, textureUrl, gl) {
    const response = await fetch(objUrl);
    const objData = ObjLoader.parse(await response.text());

    // Create and compile the material
    const material = new Material(gl, vertexShaderSource, fragmentShaderSource);
    await material.addTexture(textureUrl, 'uTexture'); // Load texture and bind it to 'uTexture'

    // Create the player as a special type of Entity
    const player = new Player(objData, gl, material);

    // Player-specific setup
    player.position = [0, 0, -5]; // Initial position
    player.scale = [1, 1, 1]; // Scale

    // // Extend player controls
    // player.handleInput = (deltaTime) => {
    //     const speed = 5 * deltaTime; // Movement speed
    //     if (input.isKeyPressed('ArrowLeft')) {
    //         player.position[0] -= speed;
    //     }
    //     if (input.isKeyPressed('ArrowRight')) {
    //         player.position[0] += speed;
    //     }
    //
    //     // Clamp movement within screen bounds (adjust as necessary)
    //     const minX = -5;
    //     const maxX = 5;
    //     player.position[0] = Math.max(minX, Math.min(maxX, player.position[0]));
    // };

    return player;
}


/**
 * Main function to initialize the engine and render the scene.
 */
async function main() {
    const engine = new Engine("webgl-canvas");
    engine.init();

    const gl = engine.renderer.gl;

    const camera = engine.scene.camera;
    camera.position = [0, 2, 10];
    camera.target = [0, 1, 0];

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

    const objEntity = await createObjEntityWithTexture('./assets/cube.obj', './assets/Textures/RockyWalls_BaseColorWall_1Final.png', gl);
    objEntity.position = [0, 1, -5];
    objEntity.scale = [1, 1, 1];
    objEntity.rotation = [0, Math.PI / 4, 0];

   // engine.scene.addEntity(objEntity);

    objEntity.material.compile();

    objEntity.material.setUniform('uViewPos', camera.position);

    console.log('Entities:', engine.scene.entities);
    console.log('Lights:', engine.scene.lights);

   // const player = createPlayer()
    const player = await createPlayer('./assets/spaceship8.obj', './assets/Textures/Tiledfloor_basecolor.png', gl);
    player.position = [0, 1, -5];
    player.scale = [0.1, 0.1, 0.1];
    engine.scene.addEntity(player);

    player.material.compile();

    player.material.setUniform('uViewPos', camera.position);

    engine.OnUpdate.Connect((deltaTime) => {
        player.handleInput(engine.input, deltaTime);
    });

    engine.start();
}

main();
