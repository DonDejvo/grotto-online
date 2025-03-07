import { Shader } from "./Shader.js";

export const debugDraw = (function () {

    const lineVertexSource = `#version 300 es
    
layout (location=0) in vec2 a_position;
layout (location=1) in vec4 a_color;

uniform mat4 u_projectionViewM;

out vec4 v_color;
 
void main() {
    v_color = a_color;

    gl_Position = u_projectionViewM * vec4(a_position, 0, 1);
}
`;

    const lineFragmentSource = `#version 300 es
precision mediump float;

in vec4 v_color;

out vec4 outColor;
 
void main() {
    outColor = v_color;
}
`;

    class DebugDraw {
        static VSIZE = 6;
        /**
         * @type {WebGL2RenderingContext}
         */
        _gl;
        constructor(gl) {
            this._gl = gl;
            this._lines = [];
            this._drawCalls = [];
            this._shader = new Shader(this._gl, lineVertexSource, lineFragmentSource, [
                ["projectionViewM", "mat4"]
            ]);
        }
        start() {
            this._shader.start();

            this._vao = this._gl.createVertexArray();
            this._gl.bindVertexArray(this._vao);
            this._vbo = this._gl.createBuffer();
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vbo);

            this._gl.vertexAttribPointer(0, 2, this._gl.FLOAT, false, DebugDraw.VSIZE * 4, 0 * 4);
            this._gl.vertexAttribPointer(1, 4, this._gl.FLOAT, false, DebugDraw.VSIZE * 4, 2 * 4);

            this._gl.bindVertexArray(null);
        }
        destroy() {
            this._gl.deleteBuffer(this._vbo);
            this._gl.deleteVertexArray(this._vao);
            this._shader.destroy();
            this._textRenderer.destroy();
        }
        addLine(x1, y1, x2, y2, color, camera) {
            this._lines.push({ x1, y1, x2, y2, color, camera });
        }
        addRect(x, y, w, h, color, camera) {
            this._lines.push({ x1: x, y1: y, x2: x + w, y2: y, color, camera });
            this._lines.push({ x1: x + w, y1: y, x2: x + w, y2: y + h, color, camera });
            this._lines.push({ x1: x + w, y1: y + h, x2: x, y2: y + h, color, camera });
            this._lines.push({ x1: x, y1: y + h, x2: x, y2: y, color, camera });
        }
        beginFrame() {
            this.initBuffer();
            this._lines = [];
        }
        initBuffer() {
            const vertices = [];
            this._drawCalls = [];
            this._lines.sort((a, b) => {
                return a.camera.id - b.camera.id;
            });
            for(let line of this._lines) {
                const { x1, y1, x2, y2, color, camera } = line;
                if(this._drawCalls.length == 0 || this._drawCalls[this._drawCalls.length - 1].camera.id != camera.id) {
                    const c = {
                        offset: vertices.length / DebugDraw.VSIZE,
                        count: 2,
                        camera: camera
                    };
                    this._drawCalls.push(c);
                }
                else {
                    this._drawCalls[this._drawCalls.length - 1].count += 2;
                }

                vertices.push(x1, y1, ...color);
                vertices.push(x2, y2, ...color);
            }
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vbo);
            this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
        }
        draw() {
            this._shader.bind();
            this._gl.bindVertexArray(this._vao);

            this._gl.enableVertexAttribArray(0);
            this._gl.enableVertexAttribArray(1);

            for (let c of this._drawCalls) {
                c.camera.begin(this._gl);
                this._shader.supplyUniform("projectionViewM", c.camera.projectionView);
                this._gl.drawArrays(this._gl.LINES, c.offset, c.count);
            }

            this._gl.bindVertexArray(null);
        }
    }

    return {
        DebugDraw
    }
})();