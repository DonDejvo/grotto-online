import { Vector } from "../math/Vector.js";
import { debugDraw } from "./DebugDraw.js";
import { Shader } from "./Shader.js";
import { textRenderer } from "./TextRenderer.js";

export const renderer = (function () {

    const spriteVertexSource = `#version 300 es
     
layout (location=0) in vec2 a_position;
layout (location=1) in vec2 a_texcoord;
layout (location=2) in vec4 a_color;

uniform mat4 u_projectionViewM;

out vec2 v_texcoord;
out vec4 v_color;
 
void main() {
    v_texcoord = a_texcoord;
    v_color = a_color;

    gl_Position = u_projectionViewM * vec4(a_position, 0, 1);
}
`;

    const spriteFragmentSource = `#version 300 es
precision mediump float;

in vec2 v_texcoord;
in vec4 v_color;

uniform sampler2D u_texture;
uniform vec4 u_ambientColor;

out vec4 outColor;
 
void main() {
    outColor = u_ambientColor * v_color * texture(u_texture, v_texcoord);
}
`;
/*
    const canvasVertexSource = `#version 300 es

layout (location=0) in vec2 a_position;
layout (location=1) in vec2 a_texCoord;
    
uniform vec2 u_resolution;
    
out vec2 v_texCoord;
    
void main() {
    vec2 clipSpace = a_position / u_resolution * 2.0 - 1.0;
    
    gl_Position = vec4(clipSpace, 0, 1);
    
    v_texCoord = a_texCoord;
}
`;

    const canvasFragmentSource = `#version 300 es
precision mediump float;

in vec2 v_texCoord;

uniform sampler2D u_image;

out vec4 outColor;

vec4 getColor(sampler2D image, vec2 coord) {

    vec2 onePixel = vec2(1) / vec2(textureSize(image, 0));

    vec4 color = texture(u_image, coord + onePixel * vec2(0, 0));

    return color;
}

void main() {
    outColor = getColor(u_image, v_texCoord);
}
`;

    const createCanvasShader = (gl, uniforms, getColor) => {
        const fragmentSource = `#version 300 es
precision mediump float;
        
in vec2 v_texCoord;
        
uniform sampler2D u_texture;
uniform float u_time;
${uniforms.map(e => "uniform " + e).join("\n")}
        
out vec4 outColor;
        
vec4 getColor(vec2 texCoord) {
    vec4 color = vec4(0, 0, 0, 1);
        
    ${getColor}

    return color;
}
        
void main() {
    outColor = getColor(v_texCoord);
}
        `;
        return new Shader(gl, canvasVertexSource, fragmentSource, [
            ["resolution", "vec2"],
            ["time", "float"],
            ...uniforms.map(e => {
                const tokens = e.split(" ");
                if(tokens[1].endsWith("]")) {
                    return [tokens[0] + "[]", tokens[1].slice(2, tokens[1].length - 3)];
                }
                return [tokens[0], tokens[1].slice(2)];
            })
        ]);
    }
*/
    class SpriteBatch {
        static MAX_SPRITES = 10000;
        static VSIZE = 8;
        static vertices = [
            -0.5, -0.5,
            0.5, -0.5,
            0.5, 0.5,
            -0.5, 0.5
        ];
        /**
         * @type {WebGL2RenderingContext}
         */
        _gl;
        constructor(gl) {
            this._gl = gl;
            this._sprites = [];
            this._drawCalls = [];
        }
        start() {
            this._vao = this._gl.createVertexArray();
            this._gl.bindVertexArray(this._vao);
            this._vbo = this._gl.createBuffer();
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vbo);
            this._ebo = this._gl.createBuffer();
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this._ebo);
            const indices = [];
            for (let i = 0; i < SpriteBatch.MAX_SPRITES; ++i) {
                indices.push(i * 4,
                    i * 4 + 1,
                    i * 4 + 2,
                    i * 4,
                    i * 4 + 2,
                    i * 4 + 3);
            }
            this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this._gl.STATIC_DRAW);

            this._gl.vertexAttribPointer(0, 2, this._gl.FLOAT, false, SpriteBatch.VSIZE * 4, 0 * 4);
            this._gl.vertexAttribPointer(1, 2, this._gl.FLOAT, false, SpriteBatch.VSIZE * 4, 2 * 4);
            this._gl.vertexAttribPointer(2, 4, this._gl.FLOAT, false, SpriteBatch.VSIZE * 4, 4 * 4);
            this._gl.bindVertexArray(null);
        }
        destroy() {
            this._gl.deleteBuffer(this._vao);
            this._gl.deleteBuffer(this._ebo);
            this._gl.deleteVertexArray(this._vao);
        }
        isFull() {
            return this._sprites.length == SpriteBatch.MAX_SPRITES;
        }
        add(sprite) {
            this._sprites.push(sprite);
        }
        remove(sprite) {
            let idx = this._sprites.indexOf(sprite);
            if (idx != -1) {
                this._sprites.splice(idx, 1);
                return true;
            }
            return false;
        }
        initBuffer() {
            const vertices = [];
            this._drawCalls = [];
            this._sprites.sort((a, b) => {
                return a.sprite.texture.id - b.sprite.texture.id;
            });
            for (let s of this._sprites) {
                const { sprite, x, y, sx, sy, angle } = s;
                if (this._drawCalls.length == 0 || this._drawCalls[this._drawCalls.length - 1].texture.id != sprite.texture.id) {
                    const c = {
                        offset: vertices.length / SpriteBatch.VSIZE,
                        count: 4,
                        texture: sprite.texture
                    };
                    this._drawCalls.push(c);
                }
                else {
                    this._drawCalls[this._drawCalls.length - 1].count += 4;
                }

                for(let i = 0; i < 4; ++i) {
                    let pos = new Vector(SpriteBatch.vertices[i * 2] * sx, SpriteBatch.vertices[i * 2 + 1] * sy);
                    pos.rot(angle);
                    pos.x += x;
                    pos.y += y;
                    vertices.push(pos.x, pos.y, sprite.coords[i * 2], sprite.coords[i * 2 + 1], ...sprite.color);
                }

            }
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vbo);
            this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
        }
        draw() {
            this._gl.bindVertexArray(this._vao);

            this._gl.enableVertexAttribArray(0);
            this._gl.enableVertexAttribArray(1);
            this._gl.enableVertexAttribArray(2);

            for (let c of this._drawCalls) {
                c.texture.bind();
                this._gl.drawElements(this._gl.TRIANGLES, c.count / 4 * 6, this._gl.UNSIGNED_SHORT, c.offset / 4 * 6 * 2);
            }

            this._gl.disableVertexAttribArray(2);

            this._gl.bindVertexArray(null);
        }
    }

    class Renderer {

        /**
         * @type {WebGL2RenderingContext}
         */
        _gl;

        constructor(gl) {
            this._gl = gl;
            this._batches = [];
            this._spriteShader = new Shader(this._gl, spriteVertexSource, spriteFragmentSource, [
                ["projectionViewM", "mat4"],
                ["ambientColor", "vec4"]
            ]);
            //this._canvasShader = AssetsManager.getShader("default");
            this._debugDraw = new debugDraw.DebugDraw(this._gl);
            this._textRenderer = new textRenderer.TextRenderer(this._gl);
        }
        get debugDraw() {
            return this._debugDraw;
        }
        get textRenderer() {
            return this._textRenderer;
        }
        start() {
            this._spriteShader.start();
            //this._canvasShader.start();
            this._debugDraw.start();
            this._textRenderer.start();

            /*
            const w = this._gl.canvas.width, 
            h = this._gl.canvas.height;
            this._tex = texture.createAndSetupTexture(this._gl);
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, w, h, 0, this._gl.RGBA, this._gl.UNSIGNED_BYTE, null);
            
            this._vbo = this._gl.createBuffer();
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vbo);
            this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array([
                0, 0, 0, 0,
                w, 0, 1, 0,
                w, h, 1, 1,
                0, h, 0, 1
            ]), this._gl.STATIC_DRAW);

            this._fbo = this._gl.createFramebuffer();
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fbo);

            this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, this._tex, 0);
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
            */
        }
        destroy() {
            for (let batch of this._batches) {
                this._removeBatch(batch);
            }
            //this._gl.deleteTexture(this._tex);
            //this._gl.deleteFramebuffer(this._fbo);
            this._spriteShader.destroy();
            //this._canvasShader.destroy();
        }
        add(renderObject) {
            let batch = this._batches.find(b => !b.locked &&
                b.zIndex == renderObject.zIndex &&
                b.fixed == renderObject.fixed &&
                b.camera == renderObject.camera &&
                !b.spriteBatch.isFull());
            if (!batch) {
                batch = this._createBatch(renderObject.zIndex, renderObject.fixed, renderObject.camera, false);
            }
            batch.spriteBatch.add(renderObject);
            batch.needsUpdate = true;
        }
        remove(renderObject) {
            for (let batch of this._batches) {
                if (batch.spriteBatch.remove(renderObject)) {
                    batch.needsUpdate = true;
                }
            }
        }
        render() {

            this._spriteShader.bind();

            //this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._fbo);

            this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);

            this._gl.clearColor(0, 0, 0, 1);
            this._gl.clear(this._gl.COLOR_BUFFER_BIT);

            this._batches.sort((a, b) => a.zIndex - b.zIndex);

            for (let batch of this._batches) {
                if (batch.needsUpdate) {
                    batch.needsUpdate = !batch.fixed;
                    batch.spriteBatch.initBuffer();
                }
                //this._gl.enable(this._gl.SCISSOR_TEST);
                batch.camera.begin(this._gl);
                this._spriteShader.supplyUniform("projectionViewM", batch.camera.projectionView);
                this._spriteShader.supplyUniform("ambientColor", batch.ambientColor);
                batch.spriteBatch.draw();
                //this._gl.disable(this._gl.SCISSOR_TEST);
            }

            /*this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

            this._canvasShader.bind();

            this._gl.enableVertexAttribArray(0);
            this._gl.enableVertexAttribArray(1);
            this._gl.disableVertexAttribArray(2);

            this._gl.bindTexture(this._gl.TEXTURE_2D, this._tex);

            for(let uniform of this._canvasShader._uniforms) {
                switch(uniform.name) {
                    case "resolution":
                        this._canvasShader.supplyUniform("resolution", [this._gl.canvas.width, this._gl.canvas.height]);
                        break;
                    case "time":
                        this._canvasShader.supplyUniform("time", Date.now());
                        break;
                    default:
                        this._canvasShader.supplyUniform(uniform.name, uniform.value);
                }
            }

            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, this._vbo);
            this._gl.vertexAttribPointer(0, 2, this._gl.FLOAT, false, 4 * 4, 0 * 4);
            this._gl.vertexAttribPointer(1, 2, this._gl.FLOAT, false, 4 * 4, 2 * 4);

            this._gl.drawArrays(this._gl.TRIANGLE_FAN, 0, 4);*/

            this._debugDraw.beginFrame();
            this._debugDraw.draw();

            this._textRenderer.draw();
        }
        _createBatch(zIndex, fixed, camera, locked) {
            const spriteBatch = new SpriteBatch(this._gl);
            spriteBatch.start();
            const batch = {
                zIndex,
                fixed,
                camera,
                locked,
                spriteBatch,
                needsUpdate: true,
                ambientColor: [1, 1, 1, 1]
            }
            this._batches.push(batch);
            return batch;
        }
        _removeBatch(batch) {
            let idx = this._batches.indexOf(batch);
            if (idx != -1) {
                this._batches.splice(idx, 1);
                batch.spriteBatch.destroy();
            }
        }
    }

    return {
        Renderer,
        SpriteBatch,
        //createCanvasShader
    };

})();