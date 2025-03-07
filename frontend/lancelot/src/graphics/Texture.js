
export const texture = (function () {
    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    const createAndSetupTexture = (gl) => {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return tex;
    }
    class Texture {
        static _ids = 0;
        /**
         * @type {WebGL2RenderingContext}
         */
        _gl;
        constructor(gl, data, params) {
            this._params = params;
            this._id = Texture._ids++;
            this._gl = gl;
            this._data = data;
            this._tex = createAndSetupTexture(this._gl);

            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._data);
            
        }
        get id() {
            return this._id;
        }
        get width() {
            return this._data.width;
        }
        get height() {
            return this._data.height;
        }
        bind() {
            this._gl.bindTexture(this._gl.TEXTURE_2D, this._tex);
        }
        unbind() {
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
        }
        update() { }
        destroy() {
            this._gl.deleteTexture(this._tex);
        }
    }

    class AnimatedTexture extends Texture {
        constructor(gl, data, params) {
            super(gl, data, params);
            this._counter = 0;
            this._curFrame = 0;
            this._first = true;
            this._initFrames();
        }
        _initFrames() {
            this._frames = [];

            const anim = this._anim = this._params.anim;

            const ctx = document.createElement("canvas").getContext("2d");
            let w = ctx.canvas.width = anim.frameWidth,
            h = ctx.canvas.height = anim.frameHeight,
            margin = anim.margin,
            spacing = anim.spacing;

            for (let frame of anim.frames) {
                ctx.beginPath();
                ctx.clearRect(0, 0, w, h);
                ctx.drawImage(this._data, margin + frame.x * (w + spacing), margin + frame.y * (h + spacing), w, h, 0, 0, w, h);
                const img = new Image();
                img.src = ctx.canvas.toDataURL();
                this._frames.push(img);
            }
        }
        update(dt) {
            if (this._first || this._counter >= this._anim.frames[this._curFrame].duration) {
                this._first = false;
                this._counter = 0;
                if (++this._curFrame >= this._frames.length) {
                    this._curFrame = 0;
                }
                this._gl.bindTexture(this._gl.TEXTURE_2D, this._tex);
                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, this._frames[this._curFrame]);
            }
            this._counter += dt;
        }
    }

    return {
        createAndSetupTexture,
        Texture,
        AnimatedTexture
    }

})();