import { ObjLoader } from './ObjLoader.js';
import { Material } from './Material.js';
import { Bullet } from './Bullet.js';
import { Enemy } from './Enemy.js';
import { Player } from './Player.js';

/**
 * Common shaders for all entities.
 */
const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aTexCoord;

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
        vTexCoord = aTexCoord;

        gl_Position = uProjectionMatrix * uViewMatrix * fragPos;
    }
`;

const fragmentShaderSource = `
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
    uniform sampler2D uTexture;

    varying vec3 vNormal;
    varying vec3 vFragPos;
    varying vec2 vTexCoord;

    void main() {
        vec3 ambient = vec3(0.0);
        vec3 diffuse = vec3(0.0);
        vec3 specular = vec3(0.0);

        vec3 norm = normalize(vNormal);
        vec3 viewDir = normalize(uViewPos - vFragPos);

        for (int i = 0; i < 8; i++) {
            if (i >= uNumLights) break;

            vec3 lightDir = normalize(uLights[i].position - vFragPos);
            float diff = max(dot(norm, lightDir), 0.0);
            diffuse += diff * uLights[i].diffuse;

            vec3 reflectDir = reflect(-lightDir, norm);
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
            specular += spec * uLights[i].specular;
        }

        vec4 texColor = texture2D(uTexture, vTexCoord);
        vec3 result = texColor.rgb * (ambient + diffuse) + specular;
        gl_FragColor = vec4(result, texColor.a);
    }
`;

/**
 * Creates a player entity.
 * @param {string} objUrl - Path to the OBJ file for the player.
 * @param {string} textureUrl - Path to the texture file for the player.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @returns {Player} - The created player.
 */
export async function createPlayer(objUrl, textureUrl, gl) {
    const objData = ObjLoader.parse(await fetch(objUrl).then(res => res.text()));
    const material = new Material(gl, vertexShaderSource, fragmentShaderSource);
    await material.addTexture(textureUrl, 'uTexture');
    material.compile();

    const player = new Player(objData, gl, material);
    player.scale = [0.1, 0.1, 0.1];
    return player;
}

/**
 * Creates an enemy entity.
 * @param {string} objUrl - Path to the OBJ file for the enemy.
 * @param {string} textureUrl - Path to the texture file for the enemy.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @returns {Enemy} - The created enemy.
 */
export async function createEnemy(objUrl, textureUrl, gl) {
    const objData = ObjLoader.parse(await fetch(objUrl).then(res => res.text()));
    const material = new Material(gl, vertexShaderSource, fragmentShaderSource);
    await material.addTexture(textureUrl, 'uTexture');
    material.compile();

    const enemy = new Enemy(objData, gl, material);
    enemy.scale = [0.4, 0.4, 0.4];
    return enemy;
}

/**
 * Creates a bullet entity.
 * @param {Array<number>} position - Initial position of the bullet.
 * @param {Array<number>} direction - Direction vector for the bullet.
 * @param {number} speed - Speed of the bullet.
 * @param {Array<Entity>} ignoreList - Entities the bullet should not collide with.
 * @param {WebGLRenderingContext} gl - WebGL context.
 * @returns {Bullet} - The created bullet.
 */
export async function createBullet(position, direction, speed, ignoreList, gl) {
    const objData = ObjLoader.parse(await fetch('./assets/cube.obj').then(res => res.text()));
    const material = new Material(gl, vertexShaderSource, fragmentShaderSource);
    await material.addTexture('./assets/Textures/abe.png', 'uTexture');
    material.compile();

    const bullet = new Bullet(objData, gl, material, direction, speed, ignoreList);
    bullet.position = [...position];
    bullet.scale = [0.1, 0.1, 0.1];
    return bullet;
}
