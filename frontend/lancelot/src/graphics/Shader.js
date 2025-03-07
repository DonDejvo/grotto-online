export class Shader {
    /**
     * @type {WebGL2RenderingContext}
     */
    _gl;
    constructor(gl, vertexSource, fragmentSource, uniforms) {
        this._gl = gl;
        this._vertexSource = vertexSource;
        this._fragmentSource = fragmentSource;
        this._uniforms = uniforms.map(e => ({ name: e[0], type: e[1] }));
    }
    start() {
        this._program = this._gl.createProgram();
        this._vertexShader = this._createShader( this._gl.VERTEX_SHADER, this._vertexSource);
        this._fragmentShader = this._createShader(this._gl.FRAGMENT_SHADER, this._fragmentSource);

        this._gl.attachShader(this._program, this._vertexShader);
        this._gl.attachShader(this._program, this._fragmentShader);
        this._gl.linkProgram(this._program);
        this._gl.useProgram(this._program);
        
        for(let uniform of this._uniforms) {
            uniform.location = this._gl.getUniformLocation(this._program, "u_" + uniform.name);
        }
    }
    destroy() {
        this._gl.deleteShader(this._vertexShader);
        this._gl.deleteShader(this._fragmentShader);
        this._gl.deleteProgram(this._program);
    }
    bind() {
        this._gl.useProgram(this._program);
    }
    unbind() {
        this._gl.useProgram(null);
    }
    supplyUniform(uniformName, value) {
        const uniform = this._uniforms.find(e => e.name == uniformName);
        if(uniform) {
            switch(uniform.type) {
                case "mat3":
                    this._gl.uniformMatrix3fv(uniform.location, false, value);
                    break;
                case "mat4":
                    this._gl.uniformMatrix4fv(uniform.location, false, value);
                    break;
                case "float":
                    this._gl.uniform1f(uniform.location, value);
                    break;
                case "float[]":
                    this._gl.uniform1fv(uniform.location, value);
                    break;
                case "vec2":
                    this._gl.uniform2fv(uniform.location, value);
                    break;
                case "vec3":
                    this._gl.uniform3fv(uniform.location, value);
                    break;
                case "vec4":
                    this._gl.uniform4fv(uniform.location, value);
                    break;
            }
        }
    }
    getUniform(uniformName) {
        return this._uniforms.find(e => e.name == uniformName);
    }

    _createShader(type, src) {
        const shader = this._gl.createShader(type);
        this._gl.shaderSource(shader, src);
        this._gl.compileShader(shader);
        if(this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS) == 0) {
            console.log(this._gl.getShaderInfoLog(shader));
        }
        return shader;
    }
}