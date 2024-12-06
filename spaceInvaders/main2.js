import { Engine } from '../engine/Engine.js';
import { Light } from '../engine/Light.js';
import { Enemy } from '../engine/Enemy.js';
import { BulletManager } from '../engine/BulletManager.js';
import { createPlayer, createEnemy, createBullet } from '../engine/Factory.js';

const engine = new Engine("webgl-canvas");

async function endGame() {
    setTimeout(() => {
        alert('Game Over!');
        engine.stop();
    }, 100); // Delay the alert slightly for better rendering
}

async function shootBullet(player, bulletManager, engine, gl) {
    const bulletPosition = [...player.position];
    bulletPosition[1] += 0.5; // Slightly above the player
    const bulletDirection = [0, 0, -1];

    const bullet = await bulletManager.getBullet(bulletPosition, bulletDirection, 10, [player], gl);
    engine.scene.addEntity(bullet);
}


/**
 * Main function to initialize the engine and render the scene.
 */
async function main() {
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
// Enemies
    const enemies = [];
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 4; j++) {
            const enemy = await createEnemy('./assets/spaceship5.obj', './assets/Textures/Tiledfloor_basecolor.png', gl);
            enemy.canDescend = true;
            // Set initial position in a grid
            enemy.position = [-3 + j * 2, 0, 2 - i * 1.5 - 15];
            enemy.originalPosition = [...enemy.position];

            // Assign player as the target
            //  enemy.targetPlayer = player;

            // Set dependencies for the enemy (scene and WebGL context)
            enemy.setDependencies({
                scene: engine.scene,
                gl: gl
            });

            // Add enemy to the scene and enemies array
            engine.scene.addEntity(enemy);
            enemies.push(enemy);
        }
    }


    // Bullet Manager
    const bulletManager = BulletManager.getInstance();
    let lastShootTime = 0;
    let lastTargetTime = 0;

    // Update function
    engine.OnUpdate.Connect((deltaTime) => {
        const currentTime = engine.lastTime;

        // Handle player input
        player.handleInput(engine.input, deltaTime);

        if (engine.input.isKeyPressed('Space') && currentTime - lastShootTime >= 1000) {
            lastShootTime = currentTime; // Reset the cooldown
            shootBullet(player, bulletManager, engine, gl);
        }

        bulletManager.update(deltaTime, engine.scene);

        // Update the timer
        lastTargetTime += deltaTime;

        if (lastTargetTime >= 3.0) {
            // Reset the timer
            lastTargetTime = 0;

            // Choose a random enemy that is not already targeting the player
            const eligibleEnemies = enemies.filter(enemy => !enemy.targetPlayer && !enemy.isDestroyed);
            if (eligibleEnemies.length > 0) {
                const randomEnemy = eligibleEnemies[Math.floor(Math.random() * eligibleEnemies.length)];
                randomEnemy.targetPlayer = player;
            }
        }

        // Update enemies
        Enemy.groupUpdate(deltaTime, enemies);

        // Check collisions between bullets and enemies
        bulletManager.checkCollisions(enemies, engine.scene, (bullet, enemy) => {
            if (bullet.ignoreList.includes(enemy)) {
                // Skip destruction if the enemy is in the ignore list
                return;
            }
            console.log('Bullet hit enemy! 1');
            engine.scene.removeEntity(enemy);
            engine.scene.removeEntity(bullet);
            enemy.destroy(engine.scene);
            bullet.destroy(engine.scene);
        });

        bulletManager.checkCollisions([player], engine.scene, (bullet, player) => {
            console.log('Bullet hit enemy! 2');
            engine.scene.removeEntity(player);
            bullet.destroy(engine.scene);

            endGame();
        });



        // Check collision between player and enemies
        enemies.forEach((enemy) => {
            if (!enemy.isDestroyed && checkCollision(player, enemy)) {
                console.log('Player collided with enemy!');
                engine.scene.removeEntity(player);
                engine.scene.removeEntity(enemy);
                player.destroy(engine.scene);
                enemy.destroy(engine.scene);

                endGame();
            }
        });


    });

    engine.start();

    // window.addEventListener("keydown", (event) => {
    //     if (event.code === "Space") {
    //         const bulletPosition = [...player.position];
    //         bulletPosition[1] += 0.5; // Above player
    //         const bulletDirection = [0, 0, -1];
    //         engine.scene.addEntity(bulletManager.createBullet(bulletPosition, bulletDirection, player));
    //     }
    // });
}

/**
 * Check collision between two entities.
 * @param {Entity} entity1 - First entity.
 * @param {Entity} entity2 - Second entity.
 * @returns {boolean} - Whether the two entities are colliding.
 */
function checkCollision(entity1, entity2) {
    if (!entity1 || !entity2 || entity1 === entity2) return false; // Avoid self-collision

    const distance = Math.sqrt(
        Math.pow(entity1.position[0] - entity2.position[0], 2) +
        Math.pow(entity1.position[1] - entity2.position[1], 2) +
        Math.pow(entity1.position[2] - entity2.position[2], 2)
    );

    return distance < 1.0; // Example collision radius
}

main();
