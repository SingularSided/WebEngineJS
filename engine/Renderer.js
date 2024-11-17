export class Renderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.gl = this.canvas.getContext('webgl');
        this.shaderProgram = null; // Will hold the compiled shader program
    }

    init() {
        const gl = this.gl;

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        this.shaderProgram = this.createShaderProgram();
    }

    createShaderProgram() {
        const gl = this.gl;

        const vertexShaderSource = `
            attribute vec3 aPosition;
            
            uniform mat4 uModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            void main() {
                mat4 uModelViewMatrix = uViewMatrix * uModelMatrix; // Combine model and view matrices
                gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
            }

        `;

        const fragmentShaderSource = `
            precision mediump float;

            void main() {
                gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
            }
        `;

        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Shader program linking failed:', gl.getProgramInfoLog(program));
        }

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Shader program linking failed:', gl.getProgramInfoLog(program));
        }

        if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader compilation failed:', gl.getShaderInfoLog(vertexShader));
        }
        if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader compilation failed:', gl.getShaderInfoLog(fragmentShader));
        }


        return program;
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.disable(gl.CULL_FACE);

        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Error compiling shader:`, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    render(scene) {
        const gl = this.gl;

        if (!this.shaderProgram) {
            console.error("Shader program not initialized.");
            return;
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(this.shaderProgram);

        // Update camera matrices
        const camera = scene.camera;
        console.log('Camera View Matrix:', camera.getViewMatrix());
        console.log('Camera Projection Matrix:', camera.getProjectionMatrix());

        const uViewMatrixLoc = gl.getUniformLocation(this.shaderProgram, 'uViewMatrix');
        const uProjectionMatrixLoc = gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix');
        console.log('View Matrix Location:', uViewMatrixLoc);
        console.log('Projection Matrix Location:', uProjectionMatrixLoc);

        gl.uniformMatrix4fv(uViewMatrixLoc, false, camera.getViewMatrix());
        gl.uniformMatrix4fv(uProjectionMatrixLoc, false, camera.getProjectionMatrix());

        // Render all entities in the scene
        scene.entities.forEach(entity => {
            entity.draw(gl, this.shaderProgram, camera);
        });

        // console.log("View Matrix:", camera.getViewMatrix());
        // console.log("Projection Matrix:", camera.getProjectionMatrix());

    }
}
