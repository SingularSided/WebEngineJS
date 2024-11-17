export class Material {
    /**
     * Constructs a material for rendering with WebGL.
     * @param {WebGLRenderingContext} gl - The WebGL context.
     * @param {string} vertexShaderSource - The source code for the vertex shader.
     * @param {string} fragmentShaderSource - The source code for the fragment shader.
     */
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl;
        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;

        this.shaderProgram = null; // The compiled shader program
        this.attributeLocations = {}; // Cached attribute locations
        this.uniformLocations = {}; // Cached uniform locations
        this.uniforms = {}; // Dynamic uniform data
    }

    /**
     * Compiles the vertex and fragment shaders and links the program.
     */
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

        // Check for linking errors
        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            console.error('Shader program linking failed:', gl.getProgramInfoLog(this.shaderProgram));
            return;
        }

        // Cache attribute and uniform locations
        this._cacheLocations();
    }

    /**
     * Compiles a shader from source code.
     * @private
     * @param {number} type - The type of shader (VERTEX_SHADER or FRAGMENT_SHADER).
     * @param {string} source - The source code for the shader.
     * @returns {WebGLShader} - The compiled shader.
     */
    _compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        // Check for compilation errors
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error(`Error compiling shader:`, gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * Caches attribute and uniform locations for the shader program.
     * @private
     */
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
            if (!uniformInfo) continue;

            console.log(`Found Uniform: ${uniformInfo.name}`);
            this.uniformLocations[uniformInfo.name] = gl.getUniformLocation(this.shaderProgram, uniformInfo.name);
        }

        console.log('Cached Uniform Locations:', this.uniformLocations);
    }

    /**
     * Sets a uniform value to be passed to the shader program.
     * @param {string} name - The name of the uniform.
     * @param {any} value - The value of the uniform.
     */
    setUniform(name, value) {
        console.log(`Setting uniform: ${name} =`, value);
        this.uniforms[name] = value;
    }

    /**
     * Applies all stored uniform values to the shader program.
     */
    applyUniforms() {
        const gl = this.gl;

        // Use this material's shader program
        gl.useProgram(this.shaderProgram);

        console.log('Uniforms in applyUniforms:', this.uniforms);

        Object.entries(this.uniforms).forEach(([name, value]) => {
            console.log(`Checking uniform: ${name}, value:`, value);

            const location = this.uniformLocations[name];
            if (!location) {
                console.warn(`Uniform location not found for: ${name}`);
                return;
            }

            console.log(`Sending uniform: ${name}, value: ${value}`);
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
