export class Material {
    constructor(gl, vertexShaderSource, fragmentShaderSource, uniforms = {}) {
        this.gl = gl;
        this.vertexShaderSource = vertexShaderSource;
        this.fragmentShaderSource = fragmentShaderSource;
        this.uniforms = uniforms;
        this.shaderProgram = null; // Compiled shader program
        this.attributeLocations = {}; // Cached attribute locations
        this.uniformLocations = {}; // Cached uniform locations
    }

    compile() {
        const gl = this.gl;

        const vertexShader = this.compileShader(gl.VERTEX_SHADER, this.vertexShaderSource);
        const fragmentShader = this.compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource);

        this.shaderProgram = gl.createProgram();
        gl.attachShader(this.shaderProgram, vertexShader);
        gl.attachShader(this.shaderProgram, fragmentShader);
        gl.linkProgram(this.shaderProgram);

        if (!gl.getProgramParameter(this.shaderProgram, gl.LINK_STATUS)) {
            console.error('Shader program linking failed:', gl.getProgramInfoLog(this.shaderProgram));
        }

        this.cacheLocations();
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

    cacheLocations() {
        const gl = this.gl;

        const numAttributes = gl.getProgramParameter(this.shaderProgram, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < numAttributes; i++) {
            const attribInfo = gl.getActiveAttrib(this.shaderProgram, i);
            this.attributeLocations[attribInfo.name] = gl.getAttribLocation(this.shaderProgram, attribInfo.name);
        }

        const numUniforms = gl.getProgramParameter(this.shaderProgram, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < numUniforms; i++) {
            const uniformInfo = gl.getActiveUniform(this.shaderProgram, i);
            this.uniformLocations[uniformInfo.name] = gl.getUniformLocation(this.shaderProgram, uniformInfo.name);
        }
    }

    setUniforms(uniforms) {
        const gl = this.gl;
        Object.entries(uniforms).forEach(([name, value]) => {
            const location = this.uniformLocations[name];
            if (!location) return;

            if (Array.isArray(value)) {
                if (value.length === 4) gl.uniform4fv(location, value);
                else if (value.length === 3) gl.uniform3fv(location, value);
            } else if (typeof value === 'number') {
                gl.uniform1f(location, value);
            }
        });
    }
}
