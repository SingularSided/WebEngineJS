export class Material {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl;
        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;

        this.shaderProgram = null; // The compiled shader program
        this.attributeLocations = {}; // Cached attribute locations
        this.uniformLocations = {}; // Cached uniform locations
        this.uniforms = {}; // Custom uniforms
    }

    compile() {
        const gl = this.gl;

        // Compile shaders
        const vertexShader = this._compileShader(gl.VERTEX_SHADER, this.vertexShaderSource);
        const fragmentShader = this._compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource);

        // Link program
        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            console.error('Shader program linking failed:', gl.getProgramInfoLog(this.shaderProgram));
            return;
        }

        this._cacheLocations();
    }

    _compileShader(type, source) {
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

    _cacheLocations() {
        const gl = this.gl;

        // Cache attribute locations
        const numAttributes = gl.getProgramParameter(this.shaderProgram, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttributes; i++) {
            const attribInfo = gl.getActiveAttrib(this.shaderProgram, i);
            this.attributeLocations[attribInfo.name] = gl.getAttribLocation(this.shaderProgram, attribInfo.name);
        }

        // Cache uniform locations
        const numUniforms = gl.getProgramParameter(this.shaderProgram, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const uniformInfo = gl.getActiveUniform(this.shaderProgram, i);
            this.uniformLocations[uniformInfo.name] = gl.getUniformLocation(this.shaderProgram, uniformInfo.name);
        }
    }

    setUniform(name, value) {
        this.uniforms[name] = value; // Store the value for future updates
    }

    applyUniforms() {
        const gl = this.gl;

        Object.entries(this.uniforms).forEach(([name, value]) => {
            const location = this.uniformLocations[name];
            if (!location) return;

            if (Array.isArray(value)) {
                if (value.length === 4) gl.uniform4fv(location, value);
                else if (value.length === 3) gl.uniform3fv(location, value);
                else if (value.length === 2) gl.uniform2fv(location, value);
            } else if (typeof value === 'number') {
                gl.uniform1f(location, value);
            }
        });
    }
}
