export class Material {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl;
        this.program = this.createShaderProgram(vertexShaderSource, fragmentShaderSource);
        this.uniformLocations = {}; // Cache for uniforms
        this.attributeLocations = {}; // Cache for attributes
    }

    createShaderProgram(vertexSource, fragmentSource) {
        const gl = this.gl;

        const vertexShader = this.compileShader(gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, fragmentSource);

        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Shader program linking failed:', gl.getProgramInfoLog(program));
            return null;
        }

        // Cache uniform and attribute locations
        this.cacheLocations(program);

        return program;
    }

    compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Error compiling shader:`, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    cacheLocations(program) {
        const gl = this.gl;
        const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);

        for (let i = 0; i < numUniforms; i++) {
            const uniform = gl.getActiveUniform(program, i);
            this.uniformLocations[uniform.name] = gl.getUniformLocation(program, uniform.name);
        }

        for (let i = 0; i < numAttributes; i++) {
            const attribute = gl.getActiveAttrib(program, i);
            this.attributeLocations[attribute.name] = gl.getAttribLocation(program, attribute.name);
        }
    }

    use() {
        this.gl.useProgram(this.program);
    }

    setUniform(name, type, value) {
        const gl = this.gl;
        const location = this.uniformLocations[name];

        if (!location) {
            console.warn(`Uniform ${name} not found in shader.`);
            return;
        }

        if (type === 'mat4') {
            gl.uniformMatrix4fv(location, false, value);
        } else if (type === 'vec3') {
            gl.uniform3fv(location, value);
        } else if (type === 'float') {
            gl.uniform1f(location, value);
        }
        // Extend as needed for other uniform types
    }
}
