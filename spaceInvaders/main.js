import { Engine } from '../engine/Engine.js';
import { Light } from '../engine/Light.js';
import { Enemy } from '../engine/Enemy.js';
import { BulletManager } from '../engine/BulletManager.js';
import { createPlayer, createEnemy, createBullet } from '../engine/Factory.js';

/**
 * Main function to initialize the engine and render the scene.
 */
async function main() {
    const engine = new Engine("webgl-canvas");
    engine.init();

    const gl = engine.renderer.gl;

    // Camera setup
    const camera = engine.scene.camera;
    camera.position = [0, 20, -10];
    camera.lookAt = [0, -1, 0]; // Look downward
    camera.up = [0, 0, -1];
    camera.update(engine.renderer.gl.canvas);

    // Lights
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

    // Player
    const player = await createPlayer('./assets/spaceship8.obj', './assets/Textures/Tiledfloor_basecolor.png', gl);
    player.position = [0, 0, -5];
    engine.scene.addEntity(player);

    // Enemies
    const enemies = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            const enemy = await createEnemy('./assets/cube.obj', './assets/Textures/RockyWalls_BaseColorWall_1Final.png', gl);
            enemy.position = [-3 + j * 2, 0, 2 - i * 1.5 - 15];
            enemy.originalPosition = [...enemy.position];
            engine.scene.addEntity(enemy);
            enemies.push(enemy);
        }
    }

    // Bullet Manager
    const bulletManager = new BulletManager();

    // Update function
    engine.OnUpdate.Connect((deltaTime) => {
        // Handle player input
        player.handleInput(engine.input, deltaTime);

        // Shoot a bullet on spacebar press
        if (engine.input.isKeyPressed(' ')) {
            const bullet = bulletManager.createBullet(
                [...player.position],
                [0, 0, -1], // Shooting straight ahead
                10,         // Speed
                [player],   // Ignore collisions with the player
                gl
            );
            engine.scene.addEntity(bullet);
        }

        // Update bullets
        bulletManager.update(deltaTime, engine.scene);

        // Update enemies
        Enemy.groupUpdate(deltaTime, enemies);

        // Check collisions between bullets and enemies
        bulletManager.checkCollisions(enemies, engine.scene, (bullet, enemy) => {
            console.log('Bullet hit enemy!');
            engine.scene.removeEntity(enemy);
            engine.scene.removeEntity(bullet);
            enemy.destroy(engine.scene);
            bullet.destroy(engine.scene);
        });

        // Check collision between player and enemies
        enemies.forEach((enemy) => {
            if (!enemy.isDestroyed && checkCollision(player, enemy)) {
                console.log('Player collided with enemy!');
                engine.scene.removeEntity(player);
                engine.scene.removeEntity(enemy);
                player.destroy(engine.scene);
                enemy.destroy(engine.scene);

                setTimeout(() => {
                    alert('Game Over!');
                    engine.stop();
                }, 100); // Delay the alert slightly for better rendering
            }
        });
    });

    engine.start();
}

/**
 * Check collision between two entities.
 * @param {Entity} entity1 - First entity.
 * @param {Entity} entity2 - Second entity.
 * @returns {boolean} - Whether the two entities are colliding.
 */
function checkCollision(entity1, entity2) {
    if (!entity1 || !entity2) return false;

    const distance = Math.sqrt(
        Math.pow(entity1.position[0] - entity2.position[0], 2) +
        Math.pow(entity1.position[1] - entity2.position[1], 2) +
        Math.pow(entity1.position[2] - entity2.position[2], 2)
    );

    return distance < 1.0; // Example collision radius
}

main();
