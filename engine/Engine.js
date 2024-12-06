import { Input } from "./Input.js";
import { Renderer } from "./Renderer.js";
import Scene from "./Scene.js";
import Event from "./Event.js";

export class Engine {
    constructor(canvasId = 'myWebGLCanvas') {
        this.renderer = new Renderer(canvasId);
        this.input = new Input();
        this.scene = new Scene();
        this.lastTime = 0; // Time tracking for delta time
        this.OnUpdate = new Event();
        this.isRunning = false; // Track whether the engine is running
        this.requestId = null; // Store the requestAnimationFrame ID
    }

    init() {
        this.renderer.init();
        this.scene.init(this.renderer.gl.canvas); // Pass canvas to initialize the scene and camera
    }

    update(deltaTime) {
        this.OnUpdate.Fire(deltaTime);
        this.scene.update(deltaTime, this.input, this.renderer.gl.canvas);
    }

    render() {
        this.renderer.render(this.scene);
    }

    gameLoop(timestamp) {
        if (!this.isRunning) return; // Exit the loop if the engine is stopped

        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 1/30);
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        this.requestId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    start() {
        if (this.isRunning) return; // Prevent starting if already running

        this.isRunning = true;
        this.lastTime = performance.now(); // Reset the timestamp
        this.requestId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    stop() {
        if (!this.isRunning) return; // Prevent stopping if already stopped

        this.isRunning = false;
        if (this.requestId !== null) {
            cancelAnimationFrame(this.requestId); // Cancel the animation frame
            this.requestId = null; // Clear the stored ID
        }

        console.log("Engine stopped");
    }
}
