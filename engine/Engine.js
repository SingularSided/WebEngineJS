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
        const deltaTime = Math.min((timestamp - this.lastTime) / 1000, 1/30);
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    start() {
        requestAnimationFrame(this.gameLoop.bind(this));
    }
}
