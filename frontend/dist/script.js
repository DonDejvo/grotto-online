(() => {
  // lancelot/dist/lancelot-cdn-module.js
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var index_exports = {};
  __export(index_exports, {
    AnimatedSpriteDrawable: () => AnimatedSpriteDrawable,
    Animations: () => Animations,
    Drawable: () => Drawable,
    OrthogonalMap: () => OrthogonalMap,
    OrthogonalMapRenderer: () => OrthogonalMapRenderer,
    Sprite: () => Sprite,
    SpriteDrawable: () => SpriteDrawable,
    tilemap: () => tilemap
  });
  var Animations = class {
    static _anims = /* @__PURE__ */ new Map();
    static create(name, frames, frameWidth, frameHeight, margin, spacing) {
      this._anims.set(name, {
        name,
        frames,
        frameWidth,
        frameHeight,
        margin,
        spacing
      });
    }
    static get(name) {
      return this._anims.get(name);
    }
  };
  var Component = class _Component {
    static _ids = 0;
    constructor() {
      this._id = _Component._ids++;
      this._entity = null;
    }
    get id() {
      return this._id;
    }
    getComponent(name) {
      return this._entity.getComponent(name);
    }
    broadcast(msg) {
      this._entity.broadcast(msg);
    }
    start() {
    }
    update(dt) {
    }
    destroy() {
    }
  };
  var Drawable = class extends Component {
    constructor(params) {
      super();
      this._offset = params.offset;
      this._size = params.size;
      this._zIndex = params.zIndex;
      this._fixed = params.fixed ?? false;
      this._camera = params.camera;
      this._angle = params.angle ?? 0;
    }
    get zIndex() {
      return this._zIndex;
    }
    set zIndex(value2) {
      this._zIndex = value2;
    }
    get fixed() {
      return this._fixed;
    }
    get offset() {
      return this._offset;
    }
    get size() {
      return this._size;
    }
    get camera() {
      return this._camera;
    }
    get angle() {
      return this._angle;
    }
    set angle(value2) {
      this._angle = value2;
    }
  };
  var SpriteDrawable = class extends Drawable {
    constructor(params) {
      super(params);
      this._sprite = params.sprite;
    }
    get zIndex() {
      return this._zIndex;
    }
    set zIndex(value2) {
      this._zIndex = value2;
      this._renderObject.zIndex = value2;
      this._entity._scene.renderer.remove(this._renderObject);
      this._entity._scene.renderer.add(this._renderObject);
    }
    get sprite() {
      return this._sprite;
    }
    start() {
      const worldPos = this._entity.transform.getWorldPosition();
      this._renderObject = {
        sprite: this._sprite,
        x: worldPos.x + this._offset.x,
        y: worldPos.y + this._offset.y,
        sx: this._entity.transform.scale.x * this._size.x,
        sy: this._entity.transform.scale.y * this._size.y,
        zIndex: this._zIndex,
        fixed: this._fixed,
        camera: this._camera,
        angle: this._angle
      };
      this._entity._scene.renderer.add(this._renderObject);
    }
    destroy() {
      this._entity._scene.renderer.remove(this._renderObject);
    }
    update() {
      if (!this._fixed) {
        this._updateRenderObject();
      }
    }
    _updateRenderObject() {
      const worldPos = this._entity.transform.getWorldPosition();
      this._renderObject.x = worldPos.x + this._offset.x;
      this._renderObject.y = worldPos.y + this._offset.y;
      this._renderObject.sx = this._entity.transform.scale.x * this._size.x;
      this._renderObject.sy = this._entity.transform.scale.y * this._size.y;
      this._renderObject.angle = this._angle;
    }
  };
  var AnimatedSpriteDrawable = class extends SpriteDrawable {
    constructor(params) {
      super(params);
      this._fixed = false;
      this._animPlaying = false;
    }
    isAnimPlaying(animName) {
      return this._anim && animName == this._anim.name;
    }
    playAnim(anim, loop) {
      this._anim = anim;
      this._animPlaying = true;
      this._animCounter = 0;
      this._animCurFrame = 0;
      this._animLoop = loop;
      this._animFirst = true;
    }
    resumeAnim() {
      this._animPlaying = true;
    }
    pauseAnim() {
      this._animPlaying = false;
    }
    update(dt) {
      this._updateAnim(dt);
      this._updateRenderObject();
    }
    _updateAnim(dt) {
      if (!this._animPlaying) {
        return;
      }
      if (this._animFirst || this._animCounter >= this._anim.frames[this._animCurFrame].duration) {
        this._animFirst = false;
        this._animCounter = 0;
        if (++this._animCurFrame >= this._anim.frames.length) {
          if (this._animLoop) {
            this._animCurFrame = 0;
          } else {
            this._animPlaying = false;
            this.broadcast({ topic: "animEnd", animName: this._anim.name });
            return;
          }
        }
        let frame = this._anim.frames[this._animCurFrame];
        this._sprite.setRegion(
          this._anim.margin + frame.x * (this._anim.frameWidth + this._anim.spacing),
          this._anim.margin + frame.y * (this._anim.frameHeight + this._anim.spacing),
          this._anim.frameWidth,
          this._anim.frameHeight
        );
      }
      this._animCounter += dt;
    }
  };
  var Vector = class _Vector {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
    set(x, y) {
      this.x = x;
      this.y = y;
    }
    copy(v) {
      this.x = v.x;
      this.y = v.y;
      return this;
    }
    clone() {
      return new _Vector(this.x, this.y);
    }
    add(v) {
      this.x += v.x;
      this.y += v.y;
      return this;
    }
    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      return this;
    }
    scale(s) {
      this.x *= s;
      this.y *= s;
      return this;
    }
    lerp(v, s) {
      return this.add(v.clone().sub(this).scale(s));
    }
    mag() {
      return (this.x * this.x + this.y * this.y) ** 0.5;
    }
    unit() {
      let d = this.mag();
      if (d == 0) {
        this.x = 0;
        this.y = 0;
      } else {
        this.x /= d;
        this.y /= d;
      }
      return this;
    }
    rot(rad) {
      let s = Math.sin(rad), c = Math.cos(rad);
      let x = c * this.x - s * this.y;
      let y = s * this.x + c * this.y;
      this.x = x;
      this.y = y;
      return this;
    }
    transformMat(m) {
      let x = this.x, y = this.y, z = 0, w = 1;
      let out = [
        m[0] * x + m[4] * y + m[8] * z + m[12] * w,
        m[1] * x + m[5] * y + m[9] * z + m[13] * w,
        m[2] * x + m[6] * y + m[10] * z + m[14] * w,
        m[3] * x + m[7] * y + m[11] * z + m[15] * w
      ];
      this.x = out[0] / out[3];
      this.y = out[1] / out[3];
      return this;
    }
  };
  var Sprite = class {
    constructor(t) {
      this.texture = t;
      this.coords = [
        0,
        0,
        1,
        0,
        1,
        1,
        0,
        1
      ];
      this.color = [1, 1, 1, 1];
    }
    setRegion(x, y, w, h) {
      this.coords[0] = x / this.texture.width;
      this.coords[1] = y / this.texture.height;
      this.coords[2] = (x + w) / this.texture.width;
      this.coords[3] = y / this.texture.height;
      this.coords[4] = (x + w) / this.texture.width;
      this.coords[5] = (y + h) / this.texture.height;
      this.coords[6] = x / this.texture.width;
      this.coords[7] = (y + h) / this.texture.height;
    }
  };
  var texture = /* @__PURE__ */ function() {
    const createAndSetupTexture = (gl) => {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      return tex;
    };
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
      update() {
      }
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
        let w = ctx.canvas.width = anim.frameWidth, h = ctx.canvas.height = anim.frameHeight, margin = anim.margin, spacing = anim.spacing;
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
    };
  }();
  var OrthogonalMapRenderer = class extends Component {
    constructor(params) {
      super();
      this._params = params;
      this._textures = {
        tilesets: [],
        animatedTiles: []
      };
      this._batches = [];
    }
    start() {
      const tilemap2 = this._params.tilemap;
      const tilesets = tilemap2.getTilesets();
      for (let i = 0; i < tilesets.length; ++i) {
        const tileset = tilesets[i];
        let tilesetTex = new texture.Texture(this._entity._scene.renderer._gl, this._params.tilesets[tileset.name], {});
        this._textures.tilesets.push({
          name: tileset.name,
          texture: tilesetTex
        });
        for (let i2 = 0; i2 < tileset.tilecount; ++i2) {
          const tile = tileset.getTileByIndex(i2);
          if (tile.animation) {
            let animtedTileTex = new texture.AnimatedTexture(this._entity._scene.renderer._gl, this._params.tilesets[tileset.name], {
              anim: {
                frameWidth: tileset.tilewidth,
                frameHeight: tileset.tileheight,
                margin: tileset.margin,
                spacing: tileset.spacing,
                frames: tile.animation.map((e) => {
                  let frameTile = tileset.getTileByIndex(e.tileid);
                  return { x: frameTile.x, y: frameTile.y, duration: e.duration / 1e3 };
                })
              }
            });
            this._textures.animatedTiles.push({
              tileId: tile.id,
              texture: animtedTileTex
            });
          }
        }
      }
      const layers = tilemap2.getLayers();
      for (let i = 0; i < layers.length; ++i) {
        const layer = layers[i];
        let batch;
        switch (layer.type) {
          case "tilelayer": {
            batch = this._entity._scene.renderer._createBatch(layer.zIndex, true, this._params.camera, true);
            for (let j = 0; j < layer.height; ++j) {
              for (let k = 0; k < layer.width; ++k) {
                const tile = layer.getTile(k, j);
                if (tile) {
                  let sprite;
                  if (tile.animation) {
                    sprite = new Sprite(this._textures.animatedTiles.find((e) => e.tileId == tile.id).texture);
                  } else {
                    sprite = new Sprite(this._textures.tilesets.find((e) => e.name == tile.tileset.name).texture);
                    sprite.setRegion(
                      tile.tileset.margin + tile.x * (tilemap2.tilewidth + tile.tileset.spacing),
                      tile.tileset.margin + tile.y * (tilemap2.tileheight + tile.tileset.spacing),
                      tilemap2.tilewidth,
                      tilemap2.tileheight
                    );
                  }
                  const renderObject = {
                    sprite,
                    zIndex: i,
                    fixed: true,
                    x: (k + layer.x + 0.5) * tilemap2.tilewidth,
                    y: (j + layer.y + 0.5) * tilemap2.tileheight,
                    sx: tilemap2.tilewidth,
                    sy: tilemap2.tileheight,
                    angle: 0
                  };
                  batch.spriteBatch.add(renderObject);
                }
              }
            }
            break;
          }
          case "objectgroup": {
            let objects = layer.getObjects();
            batch = this._entity._scene.renderer._createBatch(layer.zIndex, true, this._params.camera, true);
            for (let o of objects) {
              if (o.gid) {
                let tile = tilemap2.getTileById(o.gid);
                if (!tile) {
                  continue;
                }
                let sprite;
                if (tile.animation) {
                  sprite = new Sprite(this._textures.animatedTiles.find((e) => e.tileId == tile.id).texture);
                } else {
                  sprite = new Sprite(this._textures.tilesets.find((e) => e.name == tile.tileset.name).texture);
                  sprite.setRegion(
                    tile.tileset.margin + tile.x * (tilemap2.tilewidth + tile.tileset.spacing),
                    tile.tileset.margin + tile.y * (tilemap2.tileheight + tile.tileset.spacing),
                    tilemap2.tilewidth,
                    tilemap2.tileheight
                  );
                }
                let angle = lancelot.math.math.degToRad(o.rotation);
                let offset = new Vector(o.width / 2, -o.height / 2).rot(angle);
                const renderObject = {
                  sprite,
                  zIndex: i,
                  fixed: true,
                  x: o.x + offset.x,
                  y: o.y + offset.y,
                  sx: o.width,
                  sy: o.height,
                  angle
                };
                batch.spriteBatch.add(renderObject);
              }
            }
            break;
          }
        }
        this._batches.push({ batch, layerName: layer.name });
      }
    }
    update(dt) {
      for (let tex of this._textures.animatedTiles) {
        tex.texture.update(dt);
      }
      let layers = this._params.tilemap.getLayers();
      for (let layer of layers) {
        let batch = this._batches.find((e) => e.layerName == layer.name);
        batch.batch.ambientColor[3] = layer.opacity;
      }
    }
    destroy() {
      for (let batch of this._batches) {
        this._entity._scene.renderer._removeBatch(batch.batch);
      }
      for (let tex of this._textures.tilesets) {
        tex.destroy();
      }
      for (let tex of this._textures.animatedTiles) {
        tex.destroy();
      }
    }
  };
  var OrthogonalMap = class extends Component {
    constructor(tilemap2) {
      super();
      this._tilemap = tilemap2;
    }
    get tilemap() {
      return this._tilemap;
    }
    start() {
      for (let layer of this._tilemap.getLayers()) {
        if (layer.type != "objectgroup") {
          continue;
        }
        let objects = layer.getObjects();
        for (let o of objects) {
          this.broadcast({
            topic: "tilemapObject",
            object: o,
            layer
          });
        }
      }
    }
  };
  var Shader = class {
    /**
     * @type {WebGL2RenderingContext}
     */
    _gl;
    constructor(gl, vertexSource, fragmentSource, uniforms) {
      this._gl = gl;
      this._vertexSource = vertexSource;
      this._fragmentSource = fragmentSource;
      this._uniforms = uniforms.map((e) => ({ name: e[0], type: e[1] }));
    }
    start() {
      this._program = this._gl.createProgram();
      this._vertexShader = this._createShader(this._gl.VERTEX_SHADER, this._vertexSource);
      this._fragmentShader = this._createShader(this._gl.FRAGMENT_SHADER, this._fragmentSource);
      this._gl.attachShader(this._program, this._vertexShader);
      this._gl.attachShader(this._program, this._fragmentShader);
      this._gl.linkProgram(this._program);
      this._gl.useProgram(this._program);
      for (let uniform of this._uniforms) {
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
    supplyUniform(uniformName, value2) {
      const uniform = this._uniforms.find((e) => e.name == uniformName);
      if (uniform) {
        switch (uniform.type) {
          case "mat3":
            this._gl.uniformMatrix3fv(uniform.location, false, value2);
            break;
          case "mat4":
            this._gl.uniformMatrix4fv(uniform.location, false, value2);
            break;
          case "float":
            this._gl.uniform1f(uniform.location, value2);
            break;
          case "float[]":
            this._gl.uniform1fv(uniform.location, value2);
            break;
          case "vec2":
            this._gl.uniform2fv(uniform.location, value2);
            break;
          case "vec3":
            this._gl.uniform3fv(uniform.location, value2);
            break;
          case "vec4":
            this._gl.uniform4fv(uniform.location, value2);
            break;
        }
      }
    }
    getUniform(uniformName) {
      return this._uniforms.find((e) => e.name == uniformName);
    }
    _createShader(type, src) {
      const shader = this._gl.createShader(type);
      this._gl.shaderSource(shader, src);
      this._gl.compileShader(shader);
      if (this._gl.getShaderParameter(shader, this._gl.COMPILE_STATUS) == 0) {
        console.log(this._gl.getShaderInfoLog(shader));
      }
      return shader;
    }
  };
  var debugDraw = /* @__PURE__ */ function() {
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
      addLine(x1, y1, x2, y2, color, camera2) {
        this._lines.push({ x1, y1, x2, y2, color, camera: camera2 });
      }
      addRect(x, y, w, h, color, camera2) {
        this._lines.push({ x1: x, y1: y, x2: x + w, y2: y, color, camera: camera2 });
        this._lines.push({ x1: x + w, y1: y, x2: x + w, y2: y + h, color, camera: camera2 });
        this._lines.push({ x1: x + w, y1: y + h, x2: x, y2: y + h, color, camera: camera2 });
        this._lines.push({ x1: x, y1: y + h, x2: x, y2: y, color, camera: camera2 });
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
        for (let line of this._lines) {
          const { x1, y1, x2, y2, color, camera: camera2 } = line;
          if (this._drawCalls.length == 0 || this._drawCalls[this._drawCalls.length - 1].camera.id != camera2.id) {
            const c = {
              offset: vertices.length / DebugDraw.VSIZE,
              count: 2,
              camera: camera2
            };
            this._drawCalls.push(c);
          } else {
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
    };
  }();
  var canvas = /* @__PURE__ */ function() {
    const resizeCanvas = (canvas2, width, height, viewportMode) => {
      let vw, vh, w, h;
      switch (viewportMode) {
        case "stretch": {
          w = innerWidth;
          h = innerHeight;
          vw = width;
          vh = height;
          break;
        }
        case "fit": {
          const aspect = width / height;
          if (aspect > innerWidth / innerHeight) {
            w = innerWidth;
            h = innerWidth / aspect;
          } else {
            w = innerHeight * aspect;
            h = innerHeight;
          }
          vw = width;
          vh = height;
          break;
        }
        case "fill": {
          w = innerWidth;
          h = innerHeight;
          const aspect = width / height;
          if (aspect > innerWidth / innerHeight) {
            const temp = w / aspect;
            vw = width;
            vh = height;
          } else {
            const temp = h * aspect;
            vw = width;
            vh = height;
          }
          break;
        }
      }
      canvas2.width = vw;
      canvas2.height = vh;
      canvas2.style.width = w + "px";
      canvas2.style.height = h + "px";
      canvas2.style.marginTop = (innerHeight - h) / 2 + "px";
      canvas2.style.marginLeft = (innerWidth - w) / 2 + "px";
    };
    class GLCanvas {
      constructor() {
        this._width = 300;
        this._height = 150;
        this._domElement = document.createElement("canvas");
        this._context = this._domElement.getContext("webgl2");
      }
      get domElement() {
        return this._domElement;
      }
      get context() {
        return this._context;
      }
      start() {
        addEventListener("resize", () => this._onResize());
        this._onResize();
      }
      setViewportMode(mode) {
        this._viewportMode = mode;
      }
      setSize(w, h) {
        this._width = w;
        this._height = h;
      }
      _onResize() {
        resizeCanvas(this._domElement, this._width, this._height, this._viewportMode);
      }
    }
    return {
      resizeCanvas,
      GLCanvas
    };
  }();
  var textRenderer = /* @__PURE__ */ function() {
    class TextRenderer {
      /**
       * @type {WebGL2RenderingContext}
       */
      _gl;
      constructor(gl) {
        this._gl = gl;
        this._texts = [];
      }
      start() {
        this._textCanvasCtx = document.createElement("canvas").getContext("2d");
        this._textCanvasCtx.canvas.style.position = "absolute";
        this._textCanvasCtx.canvas.style.zIndex = 10;
        this._textCanvasCtx.canvas.style.backgroundColor = "transparent";
        this._textCanvasCtx.canvas.style.left = "0";
        this._textCanvasCtx.canvas.style.top = "0";
        addEventListener("resize", () => this._onResize());
        this._onResize();
        this._gl.canvas.parentElement.appendChild(this._textCanvasCtx.canvas);
      }
      _onResize() {
        canvas.resizeCanvas(this._textCanvasCtx.canvas, this._gl.canvas.width, this._gl.canvas.height, lancelot.Lancelot._get()._config.viewportMode);
      }
      destroy() {
      }
      add(text, x, y, camera2, params = {}) {
        this._texts.push({
          text,
          x,
          y,
          color: params.color || "black",
          fontSize: params.fontSize || "12px",
          align: params.align || "left",
          fontFamily: params.fontFamily || "system-ui",
          camera: camera2,
          alive: true
        });
      }
      draw() {
        this._textCanvasCtx.beginPath();
        this._textCanvasCtx.clearRect(0, 0, this._textCanvasCtx.canvas.width, this._textCanvasCtx.canvas.height);
        this._texts = this._texts.filter((e) => e.alive);
        for (let text of this._texts) {
          text.alive = false;
          let clipspace = new Vector(text.x, text.y).transformMat(text.camera.projectionView);
          let pixelX = text.camera.viewport[0] + (clipspace.x * 0.5 + 0.5) * text.camera.viewport[2];
          let pixelY = text.camera.viewport[1] + (clipspace.y * -0.5 + 0.5) * text.camera.viewport[3];
          this._textCanvasCtx.fillStyle = text.color;
          this._textCanvasCtx.font = text.fontSize + " " + text.fontFamily;
          this._textCanvasCtx.textAlign = text.align;
          this._textCanvasCtx.fillText(text.text, pixelX, pixelY);
        }
      }
    }
    return {
      TextRenderer
    };
  }();
  var renderer = /* @__PURE__ */ function() {
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
    class SpriteBatch {
      static MAX_SPRITES = 1e4;
      static VSIZE = 8;
      static vertices = [
        -0.5,
        -0.5,
        0.5,
        -0.5,
        0.5,
        0.5,
        -0.5,
        0.5
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
          indices.push(
            i * 4,
            i * 4 + 1,
            i * 4 + 2,
            i * 4,
            i * 4 + 2,
            i * 4 + 3
          );
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
          } else {
            this._drawCalls[this._drawCalls.length - 1].count += 4;
          }
          for (let i = 0; i < 4; ++i) {
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
        this._debugDraw.start();
        this._textRenderer.start();
      }
      destroy() {
        for (let batch of this._batches) {
          this._removeBatch(batch);
        }
        this._spriteShader.destroy();
      }
      add(renderObject) {
        let batch = this._batches.find((b) => !b.locked && b.zIndex == renderObject.zIndex && b.fixed == renderObject.fixed && b.camera == renderObject.camera && !b.spriteBatch.isFull());
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
        this._gl.viewport(0, 0, this._gl.canvas.width, this._gl.canvas.height);
        this._gl.clearColor(0, 0, 0, 1);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT);
        this._batches.sort((a, b) => a.zIndex - b.zIndex);
        for (let batch of this._batches) {
          if (batch.needsUpdate) {
            batch.needsUpdate = !batch.fixed;
            batch.spriteBatch.initBuffer();
          }
          batch.camera.begin(this._gl);
          this._spriteShader.supplyUniform("projectionViewM", batch.camera.projectionView);
          this._spriteShader.supplyUniform("ambientColor", batch.ambientColor);
          batch.spriteBatch.draw();
        }
        this._debugDraw.beginFrame();
        this._debugDraw.draw();
        this._textRenderer.draw();
      }
      _createBatch(zIndex, fixed, camera2, locked) {
        const spriteBatch = new SpriteBatch(this._gl);
        spriteBatch.start();
        const batch = {
          zIndex,
          fixed,
          camera: camera2,
          locked,
          spriteBatch,
          needsUpdate: true,
          ambientColor: [1, 1, 1, 1]
        };
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
      SpriteBatch
      //createCanvasShader
    };
  }();
  var assets = /* @__PURE__ */ function() {
    const loadImage2 = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          resolve(img);
        };
        img.onerror = () => {
          reject();
        };
      });
    };
    const loadJson = async (src) => {
      const response = await fetch(src);
      const data = await response.json();
      return data;
    };
    class AssetsManager2 {
      static _images = /* @__PURE__ */ new Map();
      static _jsons = /* @__PURE__ */ new Map();
      static _textures = /* @__PURE__ */ new Map();
      static _shaders = /* @__PURE__ */ new Map();
      static getImage(name) {
        return this._images.get(name);
      }
      static addImage(name, image) {
        this._images.set(name, image);
      }
      static getJson(name) {
        return this._jsons.get(name);
      }
      static addJson(name, json) {
        this._jsons.set(name, json);
      }
      static getTexture(name) {
        return this._textures.get(name);
      }
      static createTexture(name, data, params, animated) {
        const gl = lancelot.Lancelot._get()._canvas.context;
        let tex;
        if (animated) {
          tex = new texture.AnimatedTexture(gl, data, params);
        } else {
          tex = new texture.Texture(gl, data, params);
        }
        this._textures.set(name, tex);
        return tex;
      }
      static getShader(name) {
        return this._shaders.get(name);
      }
      static createShader(name, uniforms, getColor) {
        const gl = lancelot.Lancelot._get()._canvas.context;
        this._shaders.set(name, renderer.createCanvasShader(gl, uniforms, getColor));
      }
    }
    return {
      loadImage: loadImage2,
      loadJson,
      AssetsManager: AssetsManager2
    };
  }();
  var tilemap = /* @__PURE__ */ function() {
    class Tile {
      constructor(x, y, tileset, animation, properties) {
        this.x = x;
        this.y = y;
        this.tileset = tileset;
        this.animation = animation;
        this.properties = properties;
      }
      get id() {
        return this.tileset.name + "[" + this.x + ";" + this.y + "]";
      }
      getProperty(name) {
        let prop = this.properties.find((e) => e.name == name);
        if (prop) {
          return prop.value;
        }
        return null;
      }
    }
    class Tileset {
      static _cache = /* @__PURE__ */ new Map();
      static async getOrLoadFromJson(filename) {
        if (this._cache.has(filename)) {
          return this._cache.get(filename);
        }
        let data = await assets.loadJson(filename);
        let tileset = new Tileset(data);
        this._cache.set(filename, tileset);
        return tileset;
      }
      constructor(params, image) {
        this._params = params;
        this._image = image;
      }
      get name() {
        return this._params.name;
      }
      get tilecount() {
        return this._params.tilecount;
      }
      get tilewidth() {
        return this._params.tilewidth;
      }
      get tileheight() {
        return this._params.tileheight;
      }
      get margin() {
        return this._params.margin;
      }
      get spacing() {
        return this._params.spacing;
      }
      getTileByIndex(idx) {
        if (idx >= this._params.tilecount || idx < 0) {
          return null;
        }
        const tileData = this._params.tiles.find((e) => e.id == idx) || {};
        return new Tile(
          idx % this._params.columns,
          ~~(idx / this._params.columns),
          this,
          tileData.animation || null,
          tileData.properties || []
        );
      }
    }
    class Layer {
      constructor(params) {
        this._tilemap = null;
        this._params = params;
        this._opacity = params.opacity;
      }
      get name() {
        return this._params.name;
      }
      get width() {
        return this._params.width;
      }
      get height() {
        return this._params.height;
      }
      get x() {
        return this._params.x;
      }
      get y() {
        return this._params.y;
      }
      get type() {
        return this._params.type;
      }
      get zIndex() {
        return this._tilemap.getLayers().indexOf(this);
      }
      get opacity() {
        return this._opacity;
      }
      set opacity(value2) {
        this._opacity = value2;
      }
    }
    class TileLayer extends Layer {
      getTile(x, y) {
        const tileId = this._params.data[y * this._params.width + x];
        if (tileId - 1 == -1) {
          return null;
        }
        return this._tilemap.getTileById(tileId);
      }
    }
    class ObjectLayer extends Layer {
      getObjects() {
        return this._params.objects;
      }
    }
    class Tilemap {
      static async loadFromJson(filename, tilesetSources) {
        let data = await assets.loadJson(filename);
        let tilemap2 = new Tilemap(
          data.width,
          data.height,
          data.tilewidth,
          data.tileheight
        );
        for (let layer of data.layers) {
          switch (layer.type) {
            case "tilelayer":
              tilemap2.addLayer(new TileLayer(layer));
              break;
            case "objectgroup":
              tilemap2.addLayer(new ObjectLayer(layer));
              break;
          }
        }
        for (let tilesetData of data.tilesets) {
          let tileset;
          if (tilesetData.source) {
            const tokens = tilesetData.source.split(/(\/|\\\/)/);
            const tilesetName = tokens[tokens.length - 1].split(".tsj")[0];
            tileset = await Tileset.getOrLoadFromJson(tilesetSources[tilesetName]);
          } else {
            tileset = new Tileset(tilesetData);
          }
          tilemap2.addTileset(tileset, tilesetData.firstgid);
        }
        return tilemap2;
      }
      constructor(width, height, tilewidth, tileheight) {
        this._width = width;
        this._height = height;
        this._tilewidth = tilewidth;
        this._tileheight = tileheight;
        this._tilesets = [];
        this._layers = [];
      }
      get width() {
        return this._width;
      }
      get height() {
        return this._height;
      }
      get tilewidth() {
        return this._tilewidth;
      }
      get tileheight() {
        return this._tileheight;
      }
      addLayer(layer) {
        layer._tilemap = this;
        this._layers.push(layer);
      }
      addTileset(tileset, firstgid) {
        this._tilesets.push({
          tileset,
          firstgid
        });
      }
      getTilesets() {
        return this._tilesets.map((e) => e.tileset);
      }
      getLayers() {
        return this._layers;
      }
      getLayerByName(name) {
        return this._layers.find((e) => e.name == name) || null;
      }
      getTileById(id) {
        const tilesets = this._tilesets;
        for (let tileset of tilesets) {
          let tile = tileset.tileset.getTileByIndex(id - tileset.firstgid);
          if (tile) {
            return tile;
          }
        }
        return null;
      }
    }
    return {
      Tileset,
      Layer,
      TileLayer,
      ObjectLayer,
      Tilemap
    };
  }();
  var index_exports2 = {};
  __export(index_exports2, {
    Store: () => Store,
    assets: () => assets
  });
  var Store = class {
    static _store = {};
    static get(name) {
      return this._store[name];
    }
    static set(name, data) {
      this._store[name] = data;
    }
  };
  var index_exports3 = {};
  __export(index_exports3, {
    Matrix: () => Matrix,
    Vector: () => Vector,
    math: () => math
  });
  var math = /* @__PURE__ */ function() {
    return {
      clamp(x, a, b) {
        return Math.min(Math.max(x, a), b);
      },
      sat(x) {
        return Math.min(Math.max(x, 0), 1);
      },
      lerp(a, b, x) {
        return a + (b - a) * x;
      },
      map(a1, b1, a0, b0, x) {
        return a1 + (b1 - a1) * (x - a0) / (b0 - a0);
      },
      degToRad(deg) {
        return deg / 180 * Math.PI;
      },
      radToDeg(rad) {
        return rad / Math.PI * 180;
      },
      randInt(min, max) {
        return ~~(Math.random() * (max - min + 1) + min);
      }
    };
  }();
  var Matrix = class {
    static create() {
      return [
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ];
    }
    static identity(out) {
      out[0] = 1;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = 1;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 1;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
      out[15] = 1;
      return out;
    }
    static ortho(out, left, right, bottom, top, near, far) {
      let lr = 1 / (left - right);
      let bt = 1 / (bottom - top);
      let nf = 1 / (near - far);
      out[0] = -2 * lr;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[5] = -2 * bt;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[10] = 2 * nf;
      out[11] = 0;
      out[12] = (left + right) * lr;
      out[13] = (top + bottom) * bt;
      out[14] = (far + near) * nf;
      out[15] = 1;
      return out;
    }
    static multiply(out, a, b) {
      let a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
      let a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
      let a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
      let a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
      let b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
      out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[4];
      b1 = b[5];
      b2 = b[6];
      b3 = b[7];
      out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[8];
      b1 = b[9];
      b2 = b[10];
      b3 = b[11];
      out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      b0 = b[12];
      b1 = b[13];
      b2 = b[14];
      b3 = b[15];
      out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
      out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
      out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
      out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
      return out;
    }
  };
  var index_exports4 = {};
  __export(index_exports4, {
    KeyListener: () => KeyListener
  });
  var KeyListener = class _KeyListener {
    static _instance = null;
    static _get() {
      if (this._instance == null) {
        this._instance = new _KeyListener();
      }
      return this._instance;
    }
    constructor() {
      this._prevKeysDown = /* @__PURE__ */ new Set();
      this._keysDown = /* @__PURE__ */ new Set();
      this._keysPressed = /* @__PURE__ */ new Set();
      this._keysReleased = /* @__PURE__ */ new Set();
    }
    start() {
      addEventListener("keydown", (e) => this._onKeyDown(e.code));
      addEventListener("keyup", (e) => this._onKeyUp(e.code));
    }
    static isDown(key) {
      return this._get()._keysDown.has(key);
    }
    static isPressed(key) {
      return this._get()._keysPressed.has(key);
    }
    static isReleased(key) {
      return this._get()._keysReleased.has(key);
    }
    update() {
      this._keysPressed.clear();
      this._keysReleased.clear();
      this._keysDown.forEach((key) => {
        if (!this._prevKeysDown.has(key)) {
          this._keysPressed.add(key);
        }
      });
      this._prevKeysDown.forEach((key) => {
        if (!this._keysDown.has(key)) {
          this._keysReleased.add(key);
        }
      });
      this._prevKeysDown = new Set(this._keysDown);
    }
    _onKeyDown(keyCode) {
      this._keysDown.add(keyCode);
    }
    _onKeyUp(keyCode) {
      this._keysDown.delete(keyCode);
    }
  };
  var index_exports5 = {};
  __export(index_exports5, {
    Collider: () => Collider,
    shape: () => shape
  });
  var shape = /* @__PURE__ */ function() {
    class Shape {
      constructor() {
        this.x = 0;
        this.y = 0;
      }
      setPosition(x, y) {
        this.x = x;
        this.y = y;
      }
    }
    class Rect extends Shape {
      constructor(w, h) {
        super();
        this.width = w;
        this.height = h;
      }
      getLeft() {
        return this.x - this.width / 2;
      }
      getRight() {
        return this.x + this.width / 2;
      }
      getTop() {
        return this.y - this.height / 2;
      }
      getBottom() {
        return this.y + this.height / 2;
      }
      intersects(shape2) {
        if (shape2 instanceof Rect) {
          return Math.abs(this.x - shape2.x) < (this.width + shape2.width) / 2 && Math.abs(this.y - shape2.y) < (this.height + shape2.height) / 2;
        }
      }
      clone() {
        let rect = new Rect(this.width, this.height);
        rect.setPosition(this.x, this.y);
        return rect;
      }
    }
    return {
      Shape,
      Rect
    };
  }();
  var Collider = class extends Component {
    constructor(params) {
      super();
      this._position = new Vector();
      this._offset = params.offset;
      this._shape = params.shape;
    }
    get shape() {
      return this._shape;
    }
    getPosition() {
      return this._position.clone();
    }
    setPosition(p) {
      this._position.copy(p);
      this._shape.setPosition(
        p.x + this._offset.x,
        p.y + this._offset.y
      );
    }
  };
  var index_exports6 = {};
  __export(index_exports6, {
    ChannelClientController: () => ChannelClientController,
    ChannelServerController: () => ChannelServerController
  });
  var Channel = class {
    channel;
    ready;
    onConnect;
    onDisconnect;
    onMessage;
    constructor(channel) {
      this.channel = channel;
      this.ready = false;
    }
    init() {
      this.channel.onmessage = (e) => {
        if (this.onMessage) {
          this.onMessage(e.data);
        }
      };
      this.channel.onopen = () => {
        this.handleChannelStateChange();
      };
      this.channel.onclose = () => {
        this.handleChannelStateChange();
      };
    }
    send(data) {
      if (this.ready) {
        this.channel.send(data);
      } else {
        console.warn("Channel: Trying to send data but channel is not ready");
      }
    }
    handleChannelStateChange() {
      const state = this.channel.readyState;
      if (state == "open") {
        this.ready = true;
        if (this.onConnect) {
          this.onConnect();
        }
      } else {
        this.ready = false;
        if (this.onDisconnect) {
          this.onDisconnect();
        }
      }
    }
  };
  var ChannelClient = class {
    serverRoom;
    signalServer;
    rtcConfig;
    remoteConnection;
    channel;
    onConnect;
    onDisconnect;
    onMessage;
    constructor(signalServer, rtcConfig) {
      this.signalServer = signalServer;
      this.rtcConfig = rtcConfig;
      this.channel = new Channel();
      this.serverRoom = null;
      signalServer.onMessage = (from, message) => {
        console.log("Client: Message type " + message.type + " received [" + this.signalServer.socket.id + "]");
        switch (message.type) {
          case "offer":
            this.handleOffer(from, message.offer);
            break;
          case "candidate":
            this.remoteConnection.addIceCandidate(message.candidate);
            break;
        }
      };
      this.channel.onConnect = () => {
        console.log("Client: Connected to the channel [" + signalServer.socket.id + "]");
        if (this.onConnect) {
          this.onConnect(this);
        }
      };
      this.channel.onDisconnect = () => {
        console.log("Client: Disconnected from the channel [" + signalServer.socket.id + "]");
        if (this.onDisconnect) {
          this.onDisconnect(this);
        }
      };
      this.channel.onMessage = (data) => {
        if (this.onMessage) {
          this.onMessage(this, data);
        }
      };
    }
    joinRoom(room) {
      this.serverRoom = room;
      this.signalServer.joinRoom(room);
    }
    leaveRoom() {
      if (this.serverRoom) {
        this.signalServer.leaveRoom(this.serverRoom);
        this.serverRoom = null;
      }
      if (this.remoteConnection) {
        this.remoteConnection.close();
      }
    }
    connect() {
      this.signalServer.start();
    }
    handleOffer(from, offer) {
      const remoteConnection = new RTCPeerConnection(this.rtcConfig);
      remoteConnection.onicecandidate = (e) => {
        this.signalServer.sendMessage(from, {
          type: "candidate",
          candidate: e.candidate
        });
      };
      remoteConnection.ondatachannel = (e) => {
        console.log("Client: ondatachannel");
        this.channel.channel = e.channel;
        this.channel.init();
      };
      remoteConnection.setRemoteDescription(offer).then(() => remoteConnection.createAnswer()).then((answer) => remoteConnection.setLocalDescription(answer)).then(() => {
        this.signalServer.sendMessage(from, {
          type: "answer",
          answer: remoteConnection.localDescription
        });
      });
      this.remoteConnection = remoteConnection;
    }
  };
  var PACKET_TYPES = /* @__PURE__ */ Object.create(null);
  PACKET_TYPES["open"] = "0";
  PACKET_TYPES["close"] = "1";
  PACKET_TYPES["ping"] = "2";
  PACKET_TYPES["pong"] = "3";
  PACKET_TYPES["message"] = "4";
  PACKET_TYPES["upgrade"] = "5";
  PACKET_TYPES["noop"] = "6";
  var PACKET_TYPES_REVERSE = /* @__PURE__ */ Object.create(null);
  Object.keys(PACKET_TYPES).forEach((key) => {
    PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
  });
  var ERROR_PACKET = { type: "error", data: "parser error" };
  var withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]";
  var withNativeArrayBuffer = typeof ArrayBuffer === "function";
  var isView = (obj) => {
    return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj && obj.buffer instanceof ArrayBuffer;
  };
  var encodePacket = ({ type, data }, supportsBinary, callback) => {
    if (withNativeBlob && data instanceof Blob) {
      if (supportsBinary) {
        return callback(data);
      } else {
        return encodeBlobAsBase64(data, callback);
      }
    } else if (withNativeArrayBuffer && (data instanceof ArrayBuffer || isView(data))) {
      if (supportsBinary) {
        return callback(data);
      } else {
        return encodeBlobAsBase64(new Blob([data]), callback);
      }
    }
    return callback(PACKET_TYPES[type] + (data || ""));
  };
  var encodeBlobAsBase64 = (data, callback) => {
    const fileReader = new FileReader();
    fileReader.onload = function() {
      const content = fileReader.result.split(",")[1];
      callback("b" + (content || ""));
    };
    return fileReader.readAsDataURL(data);
  };
  function toArray(data) {
    if (data instanceof Uint8Array) {
      return data;
    } else if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    } else {
      return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
    }
  }
  var TEXT_ENCODER;
  function encodePacketToBinary(packet, callback) {
    if (withNativeBlob && packet.data instanceof Blob) {
      return packet.data.arrayBuffer().then(toArray).then(callback);
    } else if (withNativeArrayBuffer && (packet.data instanceof ArrayBuffer || isView(packet.data))) {
      return callback(toArray(packet.data));
    }
    encodePacket(packet, false, (encoded) => {
      if (!TEXT_ENCODER) {
        TEXT_ENCODER = new TextEncoder();
      }
      callback(TEXT_ENCODER.encode(encoded));
    });
  }
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  var decode = (base64) => {
    let bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
    if (base64[base64.length - 1] === "=") {
      bufferLength--;
      if (base64[base64.length - 2] === "=") {
        bufferLength--;
      }
    }
    const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
    for (i = 0; i < len; i += 4) {
      encoded1 = lookup[base64.charCodeAt(i)];
      encoded2 = lookup[base64.charCodeAt(i + 1)];
      encoded3 = lookup[base64.charCodeAt(i + 2)];
      encoded4 = lookup[base64.charCodeAt(i + 3)];
      bytes[p++] = encoded1 << 2 | encoded2 >> 4;
      bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
      bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
    }
    return arraybuffer;
  };
  var withNativeArrayBuffer2 = typeof ArrayBuffer === "function";
  var decodePacket = (encodedPacket, binaryType) => {
    if (typeof encodedPacket !== "string") {
      return {
        type: "message",
        data: mapBinary(encodedPacket, binaryType)
      };
    }
    const type = encodedPacket.charAt(0);
    if (type === "b") {
      return {
        type: "message",
        data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
      };
    }
    const packetType = PACKET_TYPES_REVERSE[type];
    if (!packetType) {
      return ERROR_PACKET;
    }
    return encodedPacket.length > 1 ? {
      type: PACKET_TYPES_REVERSE[type],
      data: encodedPacket.substring(1)
    } : {
      type: PACKET_TYPES_REVERSE[type]
    };
  };
  var decodeBase64Packet = (data, binaryType) => {
    if (withNativeArrayBuffer2) {
      const decoded = decode(data);
      return mapBinary(decoded, binaryType);
    } else {
      return { base64: true, data };
    }
  };
  var mapBinary = (data, binaryType) => {
    switch (binaryType) {
      case "blob":
        if (data instanceof Blob) {
          return data;
        } else {
          return new Blob([data]);
        }
      case "arraybuffer":
      default:
        if (data instanceof ArrayBuffer) {
          return data;
        } else {
          return data.buffer;
        }
    }
  };
  var SEPARATOR = String.fromCharCode(30);
  var encodePayload = (packets, callback) => {
    const length = packets.length;
    const encodedPackets = new Array(length);
    let count = 0;
    packets.forEach((packet, i) => {
      encodePacket(packet, false, (encodedPacket) => {
        encodedPackets[i] = encodedPacket;
        if (++count === length) {
          callback(encodedPackets.join(SEPARATOR));
        }
      });
    });
  };
  var decodePayload = (encodedPayload, binaryType) => {
    const encodedPackets = encodedPayload.split(SEPARATOR);
    const packets = [];
    for (let i = 0; i < encodedPackets.length; i++) {
      const decodedPacket = decodePacket(encodedPackets[i], binaryType);
      packets.push(decodedPacket);
      if (decodedPacket.type === "error") {
        break;
      }
    }
    return packets;
  };
  function createPacketEncoderStream() {
    return new TransformStream({
      transform(packet, controller) {
        encodePacketToBinary(packet, (encodedPacket) => {
          const payloadLength = encodedPacket.length;
          let header;
          if (payloadLength < 126) {
            header = new Uint8Array(1);
            new DataView(header.buffer).setUint8(0, payloadLength);
          } else if (payloadLength < 65536) {
            header = new Uint8Array(3);
            const view = new DataView(header.buffer);
            view.setUint8(0, 126);
            view.setUint16(1, payloadLength);
          } else {
            header = new Uint8Array(9);
            const view = new DataView(header.buffer);
            view.setUint8(0, 127);
            view.setBigUint64(1, BigInt(payloadLength));
          }
          if (packet.data && typeof packet.data !== "string") {
            header[0] |= 128;
          }
          controller.enqueue(header);
          controller.enqueue(encodedPacket);
        });
      }
    });
  }
  var TEXT_DECODER;
  function totalLength(chunks) {
    return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  }
  function concatChunks(chunks, size) {
    if (chunks[0].length === size) {
      return chunks.shift();
    }
    const buffer = new Uint8Array(size);
    let j = 0;
    for (let i = 0; i < size; i++) {
      buffer[i] = chunks[0][j++];
      if (j === chunks[0].length) {
        chunks.shift();
        j = 0;
      }
    }
    if (chunks.length && j < chunks[0].length) {
      chunks[0] = chunks[0].slice(j);
    }
    return buffer;
  }
  function createPacketDecoderStream(maxPayload, binaryType) {
    if (!TEXT_DECODER) {
      TEXT_DECODER = new TextDecoder();
    }
    const chunks = [];
    let state = 0;
    let expectedLength = -1;
    let isBinary2 = false;
    return new TransformStream({
      transform(chunk, controller) {
        chunks.push(chunk);
        while (true) {
          if (state === 0) {
            if (totalLength(chunks) < 1) {
              break;
            }
            const header = concatChunks(chunks, 1);
            isBinary2 = (header[0] & 128) === 128;
            expectedLength = header[0] & 127;
            if (expectedLength < 126) {
              state = 3;
            } else if (expectedLength === 126) {
              state = 1;
            } else {
              state = 2;
            }
          } else if (state === 1) {
            if (totalLength(chunks) < 2) {
              break;
            }
            const headerArray = concatChunks(chunks, 2);
            expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
            state = 3;
          } else if (state === 2) {
            if (totalLength(chunks) < 8) {
              break;
            }
            const headerArray = concatChunks(chunks, 8);
            const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
            const n = view.getUint32(0);
            if (n > Math.pow(2, 53 - 32) - 1) {
              controller.enqueue(ERROR_PACKET);
              break;
            }
            expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
            state = 3;
          } else {
            if (totalLength(chunks) < expectedLength) {
              break;
            }
            const data = concatChunks(chunks, expectedLength);
            controller.enqueue(decodePacket(isBinary2 ? data : TEXT_DECODER.decode(data), binaryType));
            state = 0;
          }
          if (expectedLength === 0 || expectedLength > maxPayload) {
            controller.enqueue(ERROR_PACKET);
            break;
          }
        }
      }
    });
  }
  var protocol = 4;
  function Emitter(obj) {
    if (obj) return mixin(obj);
  }
  function mixin(obj) {
    for (var key in Emitter.prototype) {
      obj[key] = Emitter.prototype[key];
    }
    return obj;
  }
  Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};
    (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
    return this;
  };
  Emitter.prototype.once = function(event, fn) {
    function on2() {
      this.off(event, on2);
      fn.apply(this, arguments);
    }
    on2.fn = fn;
    this.on(event, on2);
    return this;
  };
  Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
    this._callbacks = this._callbacks || {};
    if (0 == arguments.length) {
      this._callbacks = {};
      return this;
    }
    var callbacks = this._callbacks["$" + event];
    if (!callbacks) return this;
    if (1 == arguments.length) {
      delete this._callbacks["$" + event];
      return this;
    }
    var cb;
    for (var i = 0; i < callbacks.length; i++) {
      cb = callbacks[i];
      if (cb === fn || cb.fn === fn) {
        callbacks.splice(i, 1);
        break;
      }
    }
    if (callbacks.length === 0) {
      delete this._callbacks["$" + event];
    }
    return this;
  };
  Emitter.prototype.emit = function(event) {
    this._callbacks = this._callbacks || {};
    var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
    for (var i = 1; i < arguments.length; i++) {
      args[i - 1] = arguments[i];
    }
    if (callbacks) {
      callbacks = callbacks.slice(0);
      for (var i = 0, len = callbacks.length; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }
    return this;
  };
  Emitter.prototype.emitReserved = Emitter.prototype.emit;
  Emitter.prototype.listeners = function(event) {
    this._callbacks = this._callbacks || {};
    return this._callbacks["$" + event] || [];
  };
  Emitter.prototype.hasListeners = function(event) {
    return !!this.listeners(event).length;
  };
  var nextTick = (() => {
    const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
    if (isPromiseAvailable) {
      return (cb) => Promise.resolve().then(cb);
    } else {
      return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
    }
  })();
  var globalThisShim = (() => {
    if (typeof self !== "undefined") {
      return self;
    } else if (typeof window !== "undefined") {
      return window;
    } else {
      return Function("return this")();
    }
  })();
  var defaultBinaryType = "arraybuffer";
  function createCookieJar() {
  }
  function pick(obj, ...attr) {
    return attr.reduce((acc, k) => {
      if (obj.hasOwnProperty(k)) {
        acc[k] = obj[k];
      }
      return acc;
    }, {});
  }
  var NATIVE_SET_TIMEOUT = globalThisShim.setTimeout;
  var NATIVE_CLEAR_TIMEOUT = globalThisShim.clearTimeout;
  function installTimerFunctions(obj, opts) {
    if (opts.useNativeTimers) {
      obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
      obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
    } else {
      obj.setTimeoutFn = globalThisShim.setTimeout.bind(globalThisShim);
      obj.clearTimeoutFn = globalThisShim.clearTimeout.bind(globalThisShim);
    }
  }
  var BASE64_OVERHEAD = 1.33;
  function byteLength(obj) {
    if (typeof obj === "string") {
      return utf8Length(obj);
    }
    return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
  }
  function utf8Length(str) {
    let c = 0, length = 0;
    for (let i = 0, l = str.length; i < l; i++) {
      c = str.charCodeAt(i);
      if (c < 128) {
        length += 1;
      } else if (c < 2048) {
        length += 2;
      } else if (c < 55296 || c >= 57344) {
        length += 3;
      } else {
        i++;
        length += 4;
      }
    }
    return length;
  }
  function randomString() {
    return Date.now().toString(36).substring(3) + Math.random().toString(36).substring(2, 5);
  }
  function encode(obj) {
    let str = "";
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) {
        if (str.length)
          str += "&";
        str += encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]);
      }
    }
    return str;
  }
  function decode2(qs) {
    let qry = {};
    let pairs = qs.split("&");
    for (let i = 0, l = pairs.length; i < l; i++) {
      let pair = pairs[i].split("=");
      qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return qry;
  }
  var TransportError = class extends Error {
    constructor(reason, description, context) {
      super(reason);
      this.description = description;
      this.context = context;
      this.type = "TransportError";
    }
  };
  var Transport = class extends Emitter {
    /**
     * Transport abstract constructor.
     *
     * @param {Object} opts - options
     * @protected
     */
    constructor(opts) {
      super();
      this.writable = false;
      installTimerFunctions(this, opts);
      this.opts = opts;
      this.query = opts.query;
      this.socket = opts.socket;
      this.supportsBinary = !opts.forceBase64;
    }
    /**
     * Emits an error.
     *
     * @param {String} reason
     * @param description
     * @param context - the error context
     * @return {Transport} for chaining
     * @protected
     */
    onError(reason, description, context) {
      super.emitReserved("error", new TransportError(reason, description, context));
      return this;
    }
    /**
     * Opens the transport.
     */
    open() {
      this.readyState = "opening";
      this.doOpen();
      return this;
    }
    /**
     * Closes the transport.
     */
    close() {
      if (this.readyState === "opening" || this.readyState === "open") {
        this.doClose();
        this.onClose();
      }
      return this;
    }
    /**
     * Sends multiple packets.
     *
     * @param {Array} packets
     */
    send(packets) {
      if (this.readyState === "open") {
        this.write(packets);
      } else {
      }
    }
    /**
     * Called upon open
     *
     * @protected
     */
    onOpen() {
      this.readyState = "open";
      this.writable = true;
      super.emitReserved("open");
    }
    /**
     * Called with data.
     *
     * @param {String} data
     * @protected
     */
    onData(data) {
      const packet = decodePacket(data, this.socket.binaryType);
      this.onPacket(packet);
    }
    /**
     * Called with a decoded packet.
     *
     * @protected
     */
    onPacket(packet) {
      super.emitReserved("packet", packet);
    }
    /**
     * Called upon close.
     *
     * @protected
     */
    onClose(details) {
      this.readyState = "closed";
      super.emitReserved("close", details);
    }
    /**
     * Pauses the transport, in order not to lose packets during an upgrade.
     *
     * @param onPause
     */
    pause(onPause) {
    }
    createUri(schema, query = {}) {
      return schema + "://" + this._hostname() + this._port() + this.opts.path + this._query(query);
    }
    _hostname() {
      const hostname = this.opts.hostname;
      return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
    }
    _port() {
      if (this.opts.port && (this.opts.secure && Number(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80)) {
        return ":" + this.opts.port;
      } else {
        return "";
      }
    }
    _query(query) {
      const encodedQuery = encode(query);
      return encodedQuery.length ? "?" + encodedQuery : "";
    }
  };
  var Polling = class extends Transport {
    constructor() {
      super(...arguments);
      this._polling = false;
    }
    get name() {
      return "polling";
    }
    /**
     * Opens the socket (triggers polling). We write a PING message to determine
     * when the transport is open.
     *
     * @protected
     */
    doOpen() {
      this._poll();
    }
    /**
     * Pauses polling.
     *
     * @param {Function} onPause - callback upon buffers are flushed and transport is paused
     * @package
     */
    pause(onPause) {
      this.readyState = "pausing";
      const pause = () => {
        this.readyState = "paused";
        onPause();
      };
      if (this._polling || !this.writable) {
        let total = 0;
        if (this._polling) {
          total++;
          this.once("pollComplete", function() {
            --total || pause();
          });
        }
        if (!this.writable) {
          total++;
          this.once("drain", function() {
            --total || pause();
          });
        }
      } else {
        pause();
      }
    }
    /**
     * Starts polling cycle.
     *
     * @private
     */
    _poll() {
      this._polling = true;
      this.doPoll();
      this.emitReserved("poll");
    }
    /**
     * Overloads onData to detect payloads.
     *
     * @protected
     */
    onData(data) {
      const callback = (packet) => {
        if ("opening" === this.readyState && packet.type === "open") {
          this.onOpen();
        }
        if ("close" === packet.type) {
          this.onClose({ description: "transport closed by the server" });
          return false;
        }
        this.onPacket(packet);
      };
      decodePayload(data, this.socket.binaryType).forEach(callback);
      if ("closed" !== this.readyState) {
        this._polling = false;
        this.emitReserved("pollComplete");
        if ("open" === this.readyState) {
          this._poll();
        } else {
        }
      }
    }
    /**
     * For polling, send a close packet.
     *
     * @protected
     */
    doClose() {
      const close = () => {
        this.write([{ type: "close" }]);
      };
      if ("open" === this.readyState) {
        close();
      } else {
        this.once("open", close);
      }
    }
    /**
     * Writes a packets payload.
     *
     * @param {Array} packets - data packets
     * @protected
     */
    write(packets) {
      this.writable = false;
      encodePayload(packets, (data) => {
        this.doWrite(data, () => {
          this.writable = true;
          this.emitReserved("drain");
        });
      });
    }
    /**
     * Generates uri for connection.
     *
     * @private
     */
    uri() {
      const schema = this.opts.secure ? "https" : "http";
      const query = this.query || {};
      if (false !== this.opts.timestampRequests) {
        query[this.opts.timestampParam] = randomString();
      }
      if (!this.supportsBinary && !query.sid) {
        query.b64 = 1;
      }
      return this.createUri(schema, query);
    }
  };
  var value = false;
  try {
    value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
  } catch (err) {
  }
  var hasCORS = value;
  function empty() {
  }
  var BaseXHR = class extends Polling {
    /**
     * XHR Polling constructor.
     *
     * @param {Object} opts
     * @package
     */
    constructor(opts) {
      super(opts);
      if (typeof location !== "undefined") {
        const isSSL = "https:" === location.protocol;
        let port = location.port;
        if (!port) {
          port = isSSL ? "443" : "80";
        }
        this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
      }
    }
    /**
     * Sends data.
     *
     * @param {String} data to send.
     * @param {Function} called upon flush.
     * @private
     */
    doWrite(data, fn) {
      const req = this.request({
        method: "POST",
        data
      });
      req.on("success", fn);
      req.on("error", (xhrStatus, context) => {
        this.onError("xhr post error", xhrStatus, context);
      });
    }
    /**
     * Starts a poll cycle.
     *
     * @private
     */
    doPoll() {
      const req = this.request();
      req.on("data", this.onData.bind(this));
      req.on("error", (xhrStatus, context) => {
        this.onError("xhr poll error", xhrStatus, context);
      });
      this.pollXhr = req;
    }
  };
  var Request = class _Request extends Emitter {
    /**
     * Request constructor
     *
     * @param {Object} options
     * @package
     */
    constructor(createRequest, uri, opts) {
      super();
      this.createRequest = createRequest;
      installTimerFunctions(this, opts);
      this._opts = opts;
      this._method = opts.method || "GET";
      this._uri = uri;
      this._data = void 0 !== opts.data ? opts.data : null;
      this._create();
    }
    /**
     * Creates the XHR object and sends the request.
     *
     * @private
     */
    _create() {
      var _a;
      const opts = pick(this._opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
      opts.xdomain = !!this._opts.xd;
      const xhr = this._xhr = this.createRequest(opts);
      try {
        xhr.open(this._method, this._uri, true);
        try {
          if (this._opts.extraHeaders) {
            xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
            for (let i in this._opts.extraHeaders) {
              if (this._opts.extraHeaders.hasOwnProperty(i)) {
                xhr.setRequestHeader(i, this._opts.extraHeaders[i]);
              }
            }
          }
        } catch (e) {
        }
        if ("POST" === this._method) {
          try {
            xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
          } catch (e) {
          }
        }
        try {
          xhr.setRequestHeader("Accept", "*/*");
        } catch (e) {
        }
        (_a = this._opts.cookieJar) === null || _a === void 0 ? void 0 : _a.addCookies(xhr);
        if ("withCredentials" in xhr) {
          xhr.withCredentials = this._opts.withCredentials;
        }
        if (this._opts.requestTimeout) {
          xhr.timeout = this._opts.requestTimeout;
        }
        xhr.onreadystatechange = () => {
          var _a2;
          if (xhr.readyState === 3) {
            (_a2 = this._opts.cookieJar) === null || _a2 === void 0 ? void 0 : _a2.parseCookies(
              // @ts-ignore
              xhr.getResponseHeader("set-cookie")
            );
          }
          if (4 !== xhr.readyState)
            return;
          if (200 === xhr.status || 1223 === xhr.status) {
            this._onLoad();
          } else {
            this.setTimeoutFn(() => {
              this._onError(typeof xhr.status === "number" ? xhr.status : 0);
            }, 0);
          }
        };
        xhr.send(this._data);
      } catch (e) {
        this.setTimeoutFn(() => {
          this._onError(e);
        }, 0);
        return;
      }
      if (typeof document !== "undefined") {
        this._index = _Request.requestsCount++;
        _Request.requests[this._index] = this;
      }
    }
    /**
     * Called upon error.
     *
     * @private
     */
    _onError(err) {
      this.emitReserved("error", err, this._xhr);
      this._cleanup(true);
    }
    /**
     * Cleans up house.
     *
     * @private
     */
    _cleanup(fromError) {
      if ("undefined" === typeof this._xhr || null === this._xhr) {
        return;
      }
      this._xhr.onreadystatechange = empty;
      if (fromError) {
        try {
          this._xhr.abort();
        } catch (e) {
        }
      }
      if (typeof document !== "undefined") {
        delete _Request.requests[this._index];
      }
      this._xhr = null;
    }
    /**
     * Called upon load.
     *
     * @private
     */
    _onLoad() {
      const data = this._xhr.responseText;
      if (data !== null) {
        this.emitReserved("data", data);
        this.emitReserved("success");
        this._cleanup();
      }
    }
    /**
     * Aborts the request.
     *
     * @package
     */
    abort() {
      this._cleanup();
    }
  };
  Request.requestsCount = 0;
  Request.requests = {};
  if (typeof document !== "undefined") {
    if (typeof attachEvent === "function") {
      attachEvent("onunload", unloadHandler);
    } else if (typeof addEventListener === "function") {
      const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
      addEventListener(terminationEvent, unloadHandler, false);
    }
  }
  function unloadHandler() {
    for (let i in Request.requests) {
      if (Request.requests.hasOwnProperty(i)) {
        Request.requests[i].abort();
      }
    }
  }
  var hasXHR2 = function() {
    const xhr = newRequest({
      xdomain: false
    });
    return xhr && xhr.responseType !== null;
  }();
  var XHR = class extends BaseXHR {
    constructor(opts) {
      super(opts);
      const forceBase64 = opts && opts.forceBase64;
      this.supportsBinary = hasXHR2 && !forceBase64;
    }
    request(opts = {}) {
      Object.assign(opts, { xd: this.xd }, this.opts);
      return new Request(newRequest, this.uri(), opts);
    }
  };
  function newRequest(opts) {
    const xdomain = opts.xdomain;
    try {
      if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
        return new XMLHttpRequest();
      }
    } catch (e) {
    }
    if (!xdomain) {
      try {
        return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
      } catch (e) {
      }
    }
  }
  var isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
  var BaseWS = class extends Transport {
    get name() {
      return "websocket";
    }
    doOpen() {
      const uri = this.uri();
      const protocols = this.opts.protocols;
      const opts = isReactNative ? {} : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
      if (this.opts.extraHeaders) {
        opts.headers = this.opts.extraHeaders;
      }
      try {
        this.ws = this.createSocket(uri, protocols, opts);
      } catch (err) {
        return this.emitReserved("error", err);
      }
      this.ws.binaryType = this.socket.binaryType;
      this.addEventListeners();
    }
    /**
     * Adds event listeners to the socket
     *
     * @private
     */
    addEventListeners() {
      this.ws.onopen = () => {
        if (this.opts.autoUnref) {
          this.ws._socket.unref();
        }
        this.onOpen();
      };
      this.ws.onclose = (closeEvent) => this.onClose({
        description: "websocket connection closed",
        context: closeEvent
      });
      this.ws.onmessage = (ev) => this.onData(ev.data);
      this.ws.onerror = (e) => this.onError("websocket error", e);
    }
    write(packets) {
      this.writable = false;
      for (let i = 0; i < packets.length; i++) {
        const packet = packets[i];
        const lastPacket = i === packets.length - 1;
        encodePacket(packet, this.supportsBinary, (data) => {
          try {
            this.doWrite(packet, data);
          } catch (e) {
          }
          if (lastPacket) {
            nextTick(() => {
              this.writable = true;
              this.emitReserved("drain");
            }, this.setTimeoutFn);
          }
        });
      }
    }
    doClose() {
      if (typeof this.ws !== "undefined") {
        this.ws.onerror = () => {
        };
        this.ws.close();
        this.ws = null;
      }
    }
    /**
     * Generates uri for connection.
     *
     * @private
     */
    uri() {
      const schema = this.opts.secure ? "wss" : "ws";
      const query = this.query || {};
      if (this.opts.timestampRequests) {
        query[this.opts.timestampParam] = randomString();
      }
      if (!this.supportsBinary) {
        query.b64 = 1;
      }
      return this.createUri(schema, query);
    }
  };
  var WebSocketCtor = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
  var WS = class extends BaseWS {
    createSocket(uri, protocols, opts) {
      return !isReactNative ? protocols ? new WebSocketCtor(uri, protocols) : new WebSocketCtor(uri) : new WebSocketCtor(uri, protocols, opts);
    }
    doWrite(_packet, data) {
      this.ws.send(data);
    }
  };
  var WT = class extends Transport {
    get name() {
      return "webtransport";
    }
    doOpen() {
      try {
        this._transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
      } catch (err) {
        return this.emitReserved("error", err);
      }
      this._transport.closed.then(() => {
        this.onClose();
      }).catch((err) => {
        this.onError("webtransport error", err);
      });
      this._transport.ready.then(() => {
        this._transport.createBidirectionalStream().then((stream) => {
          const decoderStream = createPacketDecoderStream(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
          const reader = stream.readable.pipeThrough(decoderStream).getReader();
          const encoderStream = createPacketEncoderStream();
          encoderStream.readable.pipeTo(stream.writable);
          this._writer = encoderStream.writable.getWriter();
          const read = () => {
            reader.read().then(({ done, value: value2 }) => {
              if (done) {
                return;
              }
              this.onPacket(value2);
              read();
            }).catch((err) => {
            });
          };
          read();
          const packet = { type: "open" };
          if (this.query.sid) {
            packet.data = `{"sid":"${this.query.sid}"}`;
          }
          this._writer.write(packet).then(() => this.onOpen());
        });
      });
    }
    write(packets) {
      this.writable = false;
      for (let i = 0; i < packets.length; i++) {
        const packet = packets[i];
        const lastPacket = i === packets.length - 1;
        this._writer.write(packet).then(() => {
          if (lastPacket) {
            nextTick(() => {
              this.writable = true;
              this.emitReserved("drain");
            }, this.setTimeoutFn);
          }
        });
      }
    }
    doClose() {
      var _a;
      (_a = this._transport) === null || _a === void 0 ? void 0 : _a.close();
    }
  };
  var transports = {
    websocket: WS,
    webtransport: WT,
    polling: XHR
  };
  var re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
  var parts = [
    "source",
    "protocol",
    "authority",
    "userInfo",
    "user",
    "password",
    "host",
    "port",
    "relative",
    "path",
    "directory",
    "file",
    "query",
    "anchor"
  ];
  function parse(str) {
    if (str.length > 8e3) {
      throw "URI too long";
    }
    const src = str, b = str.indexOf("["), e = str.indexOf("]");
    if (b != -1 && e != -1) {
      str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
    }
    let m = re.exec(str || ""), uri = {}, i = 14;
    while (i--) {
      uri[parts[i]] = m[i] || "";
    }
    if (b != -1 && e != -1) {
      uri.source = src;
      uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
      uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
      uri.ipv6uri = true;
    }
    uri.pathNames = pathNames(uri, uri["path"]);
    uri.queryKey = queryKey(uri, uri["query"]);
    return uri;
  }
  function pathNames(obj, path) {
    const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
    if (path.slice(0, 1) == "/" || path.length === 0) {
      names.splice(0, 1);
    }
    if (path.slice(-1) == "/") {
      names.splice(names.length - 1, 1);
    }
    return names;
  }
  function queryKey(uri, query) {
    const data = {};
    query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
      if ($1) {
        data[$1] = $2;
      }
    });
    return data;
  }
  var withEventListeners = typeof addEventListener === "function" && typeof removeEventListener === "function";
  var OFFLINE_EVENT_LISTENERS = [];
  if (withEventListeners) {
    addEventListener("offline", () => {
      OFFLINE_EVENT_LISTENERS.forEach((listener) => listener());
    }, false);
  }
  var SocketWithoutUpgrade = class _SocketWithoutUpgrade extends Emitter {
    /**
     * Socket constructor.
     *
     * @param {String|Object} uri - uri or options
     * @param {Object} opts - options
     */
    constructor(uri, opts) {
      super();
      this.binaryType = defaultBinaryType;
      this.writeBuffer = [];
      this._prevBufferLen = 0;
      this._pingInterval = -1;
      this._pingTimeout = -1;
      this._maxPayload = -1;
      this._pingTimeoutTime = Infinity;
      if (uri && "object" === typeof uri) {
        opts = uri;
        uri = null;
      }
      if (uri) {
        const parsedUri = parse(uri);
        opts.hostname = parsedUri.host;
        opts.secure = parsedUri.protocol === "https" || parsedUri.protocol === "wss";
        opts.port = parsedUri.port;
        if (parsedUri.query)
          opts.query = parsedUri.query;
      } else if (opts.host) {
        opts.hostname = parse(opts.host).host;
      }
      installTimerFunctions(this, opts);
      this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
      if (opts.hostname && !opts.port) {
        opts.port = this.secure ? "443" : "80";
      }
      this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
      this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
      this.transports = [];
      this._transportsByName = {};
      opts.transports.forEach((t) => {
        const transportName = t.prototype.name;
        this.transports.push(transportName);
        this._transportsByName[transportName] = t;
      });
      this.opts = Object.assign({
        path: "/engine.io",
        agent: false,
        withCredentials: false,
        upgrade: true,
        timestampParam: "t",
        rememberUpgrade: false,
        addTrailingSlash: true,
        rejectUnauthorized: true,
        perMessageDeflate: {
          threshold: 1024
        },
        transportOptions: {},
        closeOnBeforeunload: false
      }, opts);
      this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
      if (typeof this.opts.query === "string") {
        this.opts.query = decode2(this.opts.query);
      }
      if (withEventListeners) {
        if (this.opts.closeOnBeforeunload) {
          this._beforeunloadEventListener = () => {
            if (this.transport) {
              this.transport.removeAllListeners();
              this.transport.close();
            }
          };
          addEventListener("beforeunload", this._beforeunloadEventListener, false);
        }
        if (this.hostname !== "localhost") {
          this._offlineEventListener = () => {
            this._onClose("transport close", {
              description: "network connection lost"
            });
          };
          OFFLINE_EVENT_LISTENERS.push(this._offlineEventListener);
        }
      }
      if (this.opts.withCredentials) {
        this._cookieJar = createCookieJar();
      }
      this._open();
    }
    /**
     * Creates transport of the given type.
     *
     * @param {String} name - transport name
     * @return {Transport}
     * @private
     */
    createTransport(name) {
      const query = Object.assign({}, this.opts.query);
      query.EIO = protocol;
      query.transport = name;
      if (this.id)
        query.sid = this.id;
      const opts = Object.assign({}, this.opts, {
        query,
        socket: this,
        hostname: this.hostname,
        secure: this.secure,
        port: this.port
      }, this.opts.transportOptions[name]);
      return new this._transportsByName[name](opts);
    }
    /**
     * Initializes transport to use and starts probe.
     *
     * @private
     */
    _open() {
      if (this.transports.length === 0) {
        this.setTimeoutFn(() => {
          this.emitReserved("error", "No transports available");
        }, 0);
        return;
      }
      const transportName = this.opts.rememberUpgrade && _SocketWithoutUpgrade.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1 ? "websocket" : this.transports[0];
      this.readyState = "opening";
      const transport = this.createTransport(transportName);
      transport.open();
      this.setTransport(transport);
    }
    /**
     * Sets the current transport. Disables the existing one (if any).
     *
     * @private
     */
    setTransport(transport) {
      if (this.transport) {
        this.transport.removeAllListeners();
      }
      this.transport = transport;
      transport.on("drain", this._onDrain.bind(this)).on("packet", this._onPacket.bind(this)).on("error", this._onError.bind(this)).on("close", (reason) => this._onClose("transport close", reason));
    }
    /**
     * Called when connection is deemed open.
     *
     * @private
     */
    onOpen() {
      this.readyState = "open";
      _SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === this.transport.name;
      this.emitReserved("open");
      this.flush();
    }
    /**
     * Handles a packet.
     *
     * @private
     */
    _onPacket(packet) {
      if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
        this.emitReserved("packet", packet);
        this.emitReserved("heartbeat");
        switch (packet.type) {
          case "open":
            this.onHandshake(JSON.parse(packet.data));
            break;
          case "ping":
            this._sendPacket("pong");
            this.emitReserved("ping");
            this.emitReserved("pong");
            this._resetPingTimeout();
            break;
          case "error":
            const err = new Error("server error");
            err.code = packet.data;
            this._onError(err);
            break;
          case "message":
            this.emitReserved("data", packet.data);
            this.emitReserved("message", packet.data);
            break;
        }
      } else {
      }
    }
    /**
     * Called upon handshake completion.
     *
     * @param {Object} data - handshake obj
     * @private
     */
    onHandshake(data) {
      this.emitReserved("handshake", data);
      this.id = data.sid;
      this.transport.query.sid = data.sid;
      this._pingInterval = data.pingInterval;
      this._pingTimeout = data.pingTimeout;
      this._maxPayload = data.maxPayload;
      this.onOpen();
      if ("closed" === this.readyState)
        return;
      this._resetPingTimeout();
    }
    /**
     * Sets and resets ping timeout timer based on server pings.
     *
     * @private
     */
    _resetPingTimeout() {
      this.clearTimeoutFn(this._pingTimeoutTimer);
      const delay = this._pingInterval + this._pingTimeout;
      this._pingTimeoutTime = Date.now() + delay;
      this._pingTimeoutTimer = this.setTimeoutFn(() => {
        this._onClose("ping timeout");
      }, delay);
      if (this.opts.autoUnref) {
        this._pingTimeoutTimer.unref();
      }
    }
    /**
     * Called on `drain` event
     *
     * @private
     */
    _onDrain() {
      this.writeBuffer.splice(0, this._prevBufferLen);
      this._prevBufferLen = 0;
      if (0 === this.writeBuffer.length) {
        this.emitReserved("drain");
      } else {
        this.flush();
      }
    }
    /**
     * Flush write buffers.
     *
     * @private
     */
    flush() {
      if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
        const packets = this._getWritablePackets();
        this.transport.send(packets);
        this._prevBufferLen = packets.length;
        this.emitReserved("flush");
      }
    }
    /**
     * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
     * long-polling)
     *
     * @private
     */
    _getWritablePackets() {
      const shouldCheckPayloadSize = this._maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1;
      if (!shouldCheckPayloadSize) {
        return this.writeBuffer;
      }
      let payloadSize = 1;
      for (let i = 0; i < this.writeBuffer.length; i++) {
        const data = this.writeBuffer[i].data;
        if (data) {
          payloadSize += byteLength(data);
        }
        if (i > 0 && payloadSize > this._maxPayload) {
          return this.writeBuffer.slice(0, i);
        }
        payloadSize += 2;
      }
      return this.writeBuffer;
    }
    /**
     * Checks whether the heartbeat timer has expired but the socket has not yet been notified.
     *
     * Note: this method is private for now because it does not really fit the WebSocket API, but if we put it in the
     * `write()` method then the message would not be buffered by the Socket.IO client.
     *
     * @return {boolean}
     * @private
     */
    /* private */
    _hasPingExpired() {
      if (!this._pingTimeoutTime)
        return true;
      const hasExpired = Date.now() > this._pingTimeoutTime;
      if (hasExpired) {
        this._pingTimeoutTime = 0;
        nextTick(() => {
          this._onClose("ping timeout");
        }, this.setTimeoutFn);
      }
      return hasExpired;
    }
    /**
     * Sends a message.
     *
     * @param {String} msg - message.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @return {Socket} for chaining.
     */
    write(msg, options, fn) {
      this._sendPacket("message", msg, options, fn);
      return this;
    }
    /**
     * Sends a message. Alias of {@link Socket#write}.
     *
     * @param {String} msg - message.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @return {Socket} for chaining.
     */
    send(msg, options, fn) {
      this._sendPacket("message", msg, options, fn);
      return this;
    }
    /**
     * Sends a packet.
     *
     * @param {String} type: packet type.
     * @param {String} data.
     * @param {Object} options.
     * @param {Function} fn - callback function.
     * @private
     */
    _sendPacket(type, data, options, fn) {
      if ("function" === typeof data) {
        fn = data;
        data = void 0;
      }
      if ("function" === typeof options) {
        fn = options;
        options = null;
      }
      if ("closing" === this.readyState || "closed" === this.readyState) {
        return;
      }
      options = options || {};
      options.compress = false !== options.compress;
      const packet = {
        type,
        data,
        options
      };
      this.emitReserved("packetCreate", packet);
      this.writeBuffer.push(packet);
      if (fn)
        this.once("flush", fn);
      this.flush();
    }
    /**
     * Closes the connection.
     */
    close() {
      const close = () => {
        this._onClose("forced close");
        this.transport.close();
      };
      const cleanupAndClose = () => {
        this.off("upgrade", cleanupAndClose);
        this.off("upgradeError", cleanupAndClose);
        close();
      };
      const waitForUpgrade = () => {
        this.once("upgrade", cleanupAndClose);
        this.once("upgradeError", cleanupAndClose);
      };
      if ("opening" === this.readyState || "open" === this.readyState) {
        this.readyState = "closing";
        if (this.writeBuffer.length) {
          this.once("drain", () => {
            if (this.upgrading) {
              waitForUpgrade();
            } else {
              close();
            }
          });
        } else if (this.upgrading) {
          waitForUpgrade();
        } else {
          close();
        }
      }
      return this;
    }
    /**
     * Called upon transport error
     *
     * @private
     */
    _onError(err) {
      _SocketWithoutUpgrade.priorWebsocketSuccess = false;
      if (this.opts.tryAllTransports && this.transports.length > 1 && this.readyState === "opening") {
        this.transports.shift();
        return this._open();
      }
      this.emitReserved("error", err);
      this._onClose("transport error", err);
    }
    /**
     * Called upon transport close.
     *
     * @private
     */
    _onClose(reason, description) {
      if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
        this.clearTimeoutFn(this._pingTimeoutTimer);
        this.transport.removeAllListeners("close");
        this.transport.close();
        this.transport.removeAllListeners();
        if (withEventListeners) {
          if (this._beforeunloadEventListener) {
            removeEventListener("beforeunload", this._beforeunloadEventListener, false);
          }
          if (this._offlineEventListener) {
            const i = OFFLINE_EVENT_LISTENERS.indexOf(this._offlineEventListener);
            if (i !== -1) {
              OFFLINE_EVENT_LISTENERS.splice(i, 1);
            }
          }
        }
        this.readyState = "closed";
        this.id = null;
        this.emitReserved("close", reason, description);
        this.writeBuffer = [];
        this._prevBufferLen = 0;
      }
    }
  };
  SocketWithoutUpgrade.protocol = protocol;
  var SocketWithUpgrade = class extends SocketWithoutUpgrade {
    constructor() {
      super(...arguments);
      this._upgrades = [];
    }
    onOpen() {
      super.onOpen();
      if ("open" === this.readyState && this.opts.upgrade) {
        for (let i = 0; i < this._upgrades.length; i++) {
          this._probe(this._upgrades[i]);
        }
      }
    }
    /**
     * Probes a transport.
     *
     * @param {String} name - transport name
     * @private
     */
    _probe(name) {
      let transport = this.createTransport(name);
      let failed = false;
      SocketWithoutUpgrade.priorWebsocketSuccess = false;
      const onTransportOpen = () => {
        if (failed)
          return;
        transport.send([{ type: "ping", data: "probe" }]);
        transport.once("packet", (msg) => {
          if (failed)
            return;
          if ("pong" === msg.type && "probe" === msg.data) {
            this.upgrading = true;
            this.emitReserved("upgrading", transport);
            if (!transport)
              return;
            SocketWithoutUpgrade.priorWebsocketSuccess = "websocket" === transport.name;
            this.transport.pause(() => {
              if (failed)
                return;
              if ("closed" === this.readyState)
                return;
              cleanup();
              this.setTransport(transport);
              transport.send([{ type: "upgrade" }]);
              this.emitReserved("upgrade", transport);
              transport = null;
              this.upgrading = false;
              this.flush();
            });
          } else {
            const err = new Error("probe error");
            err.transport = transport.name;
            this.emitReserved("upgradeError", err);
          }
        });
      };
      function freezeTransport() {
        if (failed)
          return;
        failed = true;
        cleanup();
        transport.close();
        transport = null;
      }
      const onerror = (err) => {
        const error = new Error("probe error: " + err);
        error.transport = transport.name;
        freezeTransport();
        this.emitReserved("upgradeError", error);
      };
      function onTransportClose() {
        onerror("transport closed");
      }
      function onclose() {
        onerror("socket closed");
      }
      function onupgrade(to) {
        if (transport && to.name !== transport.name) {
          freezeTransport();
        }
      }
      const cleanup = () => {
        transport.removeListener("open", onTransportOpen);
        transport.removeListener("error", onerror);
        transport.removeListener("close", onTransportClose);
        this.off("close", onclose);
        this.off("upgrading", onupgrade);
      };
      transport.once("open", onTransportOpen);
      transport.once("error", onerror);
      transport.once("close", onTransportClose);
      this.once("close", onclose);
      this.once("upgrading", onupgrade);
      if (this._upgrades.indexOf("webtransport") !== -1 && name !== "webtransport") {
        this.setTimeoutFn(() => {
          if (!failed) {
            transport.open();
          }
        }, 200);
      } else {
        transport.open();
      }
    }
    onHandshake(data) {
      this._upgrades = this._filterUpgrades(data.upgrades);
      super.onHandshake(data);
    }
    /**
     * Filters upgrades, returning only those matching client transports.
     *
     * @param {Array} upgrades - server upgrades
     * @private
     */
    _filterUpgrades(upgrades) {
      const filteredUpgrades = [];
      for (let i = 0; i < upgrades.length; i++) {
        if (~this.transports.indexOf(upgrades[i]))
          filteredUpgrades.push(upgrades[i]);
      }
      return filteredUpgrades;
    }
  };
  var Socket = class extends SocketWithUpgrade {
    constructor(uri, opts = {}) {
      const o = typeof uri === "object" ? uri : opts;
      if (!o.transports || o.transports && typeof o.transports[0] === "string") {
        o.transports = (o.transports || ["polling", "websocket", "webtransport"]).map((transportName) => transports[transportName]).filter((t) => !!t);
      }
      super(uri, o);
    }
  };
  var protocol2 = Socket.protocol;
  function url(uri, path = "", loc) {
    let obj = uri;
    loc = loc || typeof location !== "undefined" && location;
    if (null == uri)
      uri = loc.protocol + "//" + loc.host;
    if (typeof uri === "string") {
      if ("/" === uri.charAt(0)) {
        if ("/" === uri.charAt(1)) {
          uri = loc.protocol + uri;
        } else {
          uri = loc.host + uri;
        }
      }
      if (!/^(https?|wss?):\/\//.test(uri)) {
        if ("undefined" !== typeof loc) {
          uri = loc.protocol + "//" + uri;
        } else {
          uri = "https://" + uri;
        }
      }
      obj = parse(uri);
    }
    if (!obj.port) {
      if (/^(http|ws)$/.test(obj.protocol)) {
        obj.port = "80";
      } else if (/^(http|ws)s$/.test(obj.protocol)) {
        obj.port = "443";
      }
    }
    obj.path = obj.path || "/";
    const ipv6 = obj.host.indexOf(":") !== -1;
    const host = ipv6 ? "[" + obj.host + "]" : obj.host;
    obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
    obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
    return obj;
  }
  var esm_exports = {};
  __export(esm_exports, {
    Decoder: () => Decoder,
    Encoder: () => Encoder,
    PacketType: () => PacketType,
    protocol: () => protocol3
  });
  var withNativeArrayBuffer3 = typeof ArrayBuffer === "function";
  var isView2 = (obj) => {
    return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
  };
  var toString = Object.prototype.toString;
  var withNativeBlob2 = typeof Blob === "function" || typeof Blob !== "undefined" && toString.call(Blob) === "[object BlobConstructor]";
  var withNativeFile = typeof File === "function" || typeof File !== "undefined" && toString.call(File) === "[object FileConstructor]";
  function isBinary(obj) {
    return withNativeArrayBuffer3 && (obj instanceof ArrayBuffer || isView2(obj)) || withNativeBlob2 && obj instanceof Blob || withNativeFile && obj instanceof File;
  }
  function hasBinary(obj, toJSON) {
    if (!obj || typeof obj !== "object") {
      return false;
    }
    if (Array.isArray(obj)) {
      for (let i = 0, l = obj.length; i < l; i++) {
        if (hasBinary(obj[i])) {
          return true;
        }
      }
      return false;
    }
    if (isBinary(obj)) {
      return true;
    }
    if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) {
      return hasBinary(obj.toJSON(), true);
    }
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
        return true;
      }
    }
    return false;
  }
  function deconstructPacket(packet) {
    const buffers = [];
    const packetData = packet.data;
    const pack = packet;
    pack.data = _deconstructPacket(packetData, buffers);
    pack.attachments = buffers.length;
    return { packet: pack, buffers };
  }
  function _deconstructPacket(data, buffers) {
    if (!data)
      return data;
    if (isBinary(data)) {
      const placeholder = { _placeholder: true, num: buffers.length };
      buffers.push(data);
      return placeholder;
    } else if (Array.isArray(data)) {
      const newData = new Array(data.length);
      for (let i = 0; i < data.length; i++) {
        newData[i] = _deconstructPacket(data[i], buffers);
      }
      return newData;
    } else if (typeof data === "object" && !(data instanceof Date)) {
      const newData = {};
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          newData[key] = _deconstructPacket(data[key], buffers);
        }
      }
      return newData;
    }
    return data;
  }
  function reconstructPacket(packet, buffers) {
    packet.data = _reconstructPacket(packet.data, buffers);
    delete packet.attachments;
    return packet;
  }
  function _reconstructPacket(data, buffers) {
    if (!data)
      return data;
    if (data && data._placeholder === true) {
      const isIndexValid = typeof data.num === "number" && data.num >= 0 && data.num < buffers.length;
      if (isIndexValid) {
        return buffers[data.num];
      } else {
        throw new Error("illegal attachments");
      }
    } else if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        data[i] = _reconstructPacket(data[i], buffers);
      }
    } else if (typeof data === "object") {
      for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          data[key] = _reconstructPacket(data[key], buffers);
        }
      }
    }
    return data;
  }
  var RESERVED_EVENTS = [
    "connect",
    "connect_error",
    "disconnect",
    "disconnecting",
    "newListener",
    "removeListener"
    // used by the Node.js EventEmitter
  ];
  var protocol3 = 5;
  var PacketType;
  (function(PacketType2) {
    PacketType2[PacketType2["CONNECT"] = 0] = "CONNECT";
    PacketType2[PacketType2["DISCONNECT"] = 1] = "DISCONNECT";
    PacketType2[PacketType2["EVENT"] = 2] = "EVENT";
    PacketType2[PacketType2["ACK"] = 3] = "ACK";
    PacketType2[PacketType2["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
    PacketType2[PacketType2["BINARY_EVENT"] = 5] = "BINARY_EVENT";
    PacketType2[PacketType2["BINARY_ACK"] = 6] = "BINARY_ACK";
  })(PacketType || (PacketType = {}));
  var Encoder = class {
    /**
     * Encoder constructor
     *
     * @param {function} replacer - custom replacer to pass down to JSON.parse
     */
    constructor(replacer) {
      this.replacer = replacer;
    }
    /**
     * Encode a packet as a single string if non-binary, or as a
     * buffer sequence, depending on packet type.
     *
     * @param {Object} obj - packet object
     */
    encode(obj) {
      if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
        if (hasBinary(obj)) {
          return this.encodeAsBinary({
            type: obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK,
            nsp: obj.nsp,
            data: obj.data,
            id: obj.id
          });
        }
      }
      return [this.encodeAsString(obj)];
    }
    /**
     * Encode packet as string.
     */
    encodeAsString(obj) {
      let str = "" + obj.type;
      if (obj.type === PacketType.BINARY_EVENT || obj.type === PacketType.BINARY_ACK) {
        str += obj.attachments + "-";
      }
      if (obj.nsp && "/" !== obj.nsp) {
        str += obj.nsp + ",";
      }
      if (null != obj.id) {
        str += obj.id;
      }
      if (null != obj.data) {
        str += JSON.stringify(obj.data, this.replacer);
      }
      return str;
    }
    /**
     * Encode packet as 'buffer sequence' by removing blobs, and
     * deconstructing packet into object with placeholders and
     * a list of buffers.
     */
    encodeAsBinary(obj) {
      const deconstruction = deconstructPacket(obj);
      const pack = this.encodeAsString(deconstruction.packet);
      const buffers = deconstruction.buffers;
      buffers.unshift(pack);
      return buffers;
    }
  };
  function isObject(value2) {
    return Object.prototype.toString.call(value2) === "[object Object]";
  }
  var Decoder = class _Decoder extends Emitter {
    /**
     * Decoder constructor
     *
     * @param {function} reviver - custom reviver to pass down to JSON.stringify
     */
    constructor(reviver) {
      super();
      this.reviver = reviver;
    }
    /**
     * Decodes an encoded packet string into packet JSON.
     *
     * @param {String} obj - encoded packet
     */
    add(obj) {
      let packet;
      if (typeof obj === "string") {
        if (this.reconstructor) {
          throw new Error("got plaintext data when reconstructing a packet");
        }
        packet = this.decodeString(obj);
        const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
        if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
          packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
          this.reconstructor = new BinaryReconstructor(packet);
          if (packet.attachments === 0) {
            super.emitReserved("decoded", packet);
          }
        } else {
          super.emitReserved("decoded", packet);
        }
      } else if (isBinary(obj) || obj.base64) {
        if (!this.reconstructor) {
          throw new Error("got binary data when not reconstructing a packet");
        } else {
          packet = this.reconstructor.takeBinaryData(obj);
          if (packet) {
            this.reconstructor = null;
            super.emitReserved("decoded", packet);
          }
        }
      } else {
        throw new Error("Unknown type: " + obj);
      }
    }
    /**
     * Decode a packet String (JSON data)
     *
     * @param {String} str
     * @return {Object} packet
     */
    decodeString(str) {
      let i = 0;
      const p = {
        type: Number(str.charAt(0))
      };
      if (PacketType[p.type] === void 0) {
        throw new Error("unknown packet type " + p.type);
      }
      if (p.type === PacketType.BINARY_EVENT || p.type === PacketType.BINARY_ACK) {
        const start = i + 1;
        while (str.charAt(++i) !== "-" && i != str.length) {
        }
        const buf = str.substring(start, i);
        if (buf != Number(buf) || str.charAt(i) !== "-") {
          throw new Error("Illegal attachments");
        }
        p.attachments = Number(buf);
      }
      if ("/" === str.charAt(i + 1)) {
        const start = i + 1;
        while (++i) {
          const c = str.charAt(i);
          if ("," === c)
            break;
          if (i === str.length)
            break;
        }
        p.nsp = str.substring(start, i);
      } else {
        p.nsp = "/";
      }
      const next = str.charAt(i + 1);
      if ("" !== next && Number(next) == next) {
        const start = i + 1;
        while (++i) {
          const c = str.charAt(i);
          if (null == c || Number(c) != c) {
            --i;
            break;
          }
          if (i === str.length)
            break;
        }
        p.id = Number(str.substring(start, i + 1));
      }
      if (str.charAt(++i)) {
        const payload = this.tryParse(str.substr(i));
        if (_Decoder.isPayloadValid(p.type, payload)) {
          p.data = payload;
        } else {
          throw new Error("invalid payload");
        }
      }
      return p;
    }
    tryParse(str) {
      try {
        return JSON.parse(str, this.reviver);
      } catch (e) {
        return false;
      }
    }
    static isPayloadValid(type, payload) {
      switch (type) {
        case PacketType.CONNECT:
          return isObject(payload);
        case PacketType.DISCONNECT:
          return payload === void 0;
        case PacketType.CONNECT_ERROR:
          return typeof payload === "string" || isObject(payload);
        case PacketType.EVENT:
        case PacketType.BINARY_EVENT:
          return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS.indexOf(payload[0]) === -1);
        case PacketType.ACK:
        case PacketType.BINARY_ACK:
          return Array.isArray(payload);
      }
    }
    /**
     * Deallocates a parser's resources
     */
    destroy() {
      if (this.reconstructor) {
        this.reconstructor.finishedReconstruction();
        this.reconstructor = null;
      }
    }
  };
  var BinaryReconstructor = class {
    constructor(packet) {
      this.packet = packet;
      this.buffers = [];
      this.reconPack = packet;
    }
    /**
     * Method to be called when binary data received from connection
     * after a BINARY_EVENT packet.
     *
     * @param {Buffer | ArrayBuffer} binData - the raw binary data received
     * @return {null | Object} returns null if more binary data is expected or
     *   a reconstructed packet object if all buffers have been received.
     */
    takeBinaryData(binData) {
      this.buffers.push(binData);
      if (this.buffers.length === this.reconPack.attachments) {
        const packet = reconstructPacket(this.reconPack, this.buffers);
        this.finishedReconstruction();
        return packet;
      }
      return null;
    }
    /**
     * Cleans up binary packet reconstruction variables.
     */
    finishedReconstruction() {
      this.reconPack = null;
      this.buffers = [];
    }
  };
  function on(obj, ev, fn) {
    obj.on(ev, fn);
    return function subDestroy() {
      obj.off(ev, fn);
    };
  }
  var RESERVED_EVENTS2 = Object.freeze({
    connect: 1,
    connect_error: 1,
    disconnect: 1,
    disconnecting: 1,
    // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
    newListener: 1,
    removeListener: 1
  });
  var Socket2 = class extends Emitter {
    /**
     * `Socket` constructor.
     */
    constructor(io, nsp, opts) {
      super();
      this.connected = false;
      this.recovered = false;
      this.receiveBuffer = [];
      this.sendBuffer = [];
      this._queue = [];
      this._queueSeq = 0;
      this.ids = 0;
      this.acks = {};
      this.flags = {};
      this.io = io;
      this.nsp = nsp;
      if (opts && opts.auth) {
        this.auth = opts.auth;
      }
      this._opts = Object.assign({}, opts);
      if (this.io._autoConnect)
        this.open();
    }
    /**
     * Whether the socket is currently disconnected
     *
     * @example
     * const socket = io();
     *
     * socket.on("connect", () => {
     *   console.log(socket.disconnected); // false
     * });
     *
     * socket.on("disconnect", () => {
     *   console.log(socket.disconnected); // true
     * });
     */
    get disconnected() {
      return !this.connected;
    }
    /**
     * Subscribe to open, close and packet events
     *
     * @private
     */
    subEvents() {
      if (this.subs)
        return;
      const io = this.io;
      this.subs = [
        on(io, "open", this.onopen.bind(this)),
        on(io, "packet", this.onpacket.bind(this)),
        on(io, "error", this.onerror.bind(this)),
        on(io, "close", this.onclose.bind(this))
      ];
    }
    /**
     * Whether the Socket will try to reconnect when its Manager connects or reconnects.
     *
     * @example
     * const socket = io();
     *
     * console.log(socket.active); // true
     *
     * socket.on("disconnect", (reason) => {
     *   if (reason === "io server disconnect") {
     *     // the disconnection was initiated by the server, you need to manually reconnect
     *     console.log(socket.active); // false
     *   }
     *   // else the socket will automatically try to reconnect
     *   console.log(socket.active); // true
     * });
     */
    get active() {
      return !!this.subs;
    }
    /**
     * "Opens" the socket.
     *
     * @example
     * const socket = io({
     *   autoConnect: false
     * });
     *
     * socket.connect();
     */
    connect() {
      if (this.connected)
        return this;
      this.subEvents();
      if (!this.io["_reconnecting"])
        this.io.open();
      if ("open" === this.io._readyState)
        this.onopen();
      return this;
    }
    /**
     * Alias for {@link connect()}.
     */
    open() {
      return this.connect();
    }
    /**
     * Sends a `message` event.
     *
     * This method mimics the WebSocket.send() method.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
     *
     * @example
     * socket.send("hello");
     *
     * // this is equivalent to
     * socket.emit("message", "hello");
     *
     * @return self
     */
    send(...args) {
      args.unshift("message");
      this.emit.apply(this, args);
      return this;
    }
    /**
     * Override `emit`.
     * If the event is in `events`, it's emitted normally.
     *
     * @example
     * socket.emit("hello", "world");
     *
     * // all serializable datastructures are supported (no need to call JSON.stringify)
     * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
     *
     * // with an acknowledgement from the server
     * socket.emit("hello", "world", (val) => {
     *   // ...
     * });
     *
     * @return self
     */
    emit(ev, ...args) {
      var _a, _b, _c;
      if (RESERVED_EVENTS2.hasOwnProperty(ev)) {
        throw new Error('"' + ev.toString() + '" is a reserved event name');
      }
      args.unshift(ev);
      if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
        this._addToQueue(args);
        return this;
      }
      const packet = {
        type: PacketType.EVENT,
        data: args
      };
      packet.options = {};
      packet.options.compress = this.flags.compress !== false;
      if ("function" === typeof args[args.length - 1]) {
        const id = this.ids++;
        const ack = args.pop();
        this._registerAckCallback(id, ack);
        packet.id = id;
      }
      const isTransportWritable = (_b = (_a = this.io.engine) === null || _a === void 0 ? void 0 : _a.transport) === null || _b === void 0 ? void 0 : _b.writable;
      const isConnected = this.connected && !((_c = this.io.engine) === null || _c === void 0 ? void 0 : _c._hasPingExpired());
      const discardPacket = this.flags.volatile && !isTransportWritable;
      if (discardPacket) {
      } else if (isConnected) {
        this.notifyOutgoingListeners(packet);
        this.packet(packet);
      } else {
        this.sendBuffer.push(packet);
      }
      this.flags = {};
      return this;
    }
    /**
     * @private
     */
    _registerAckCallback(id, ack) {
      var _a;
      const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
      if (timeout === void 0) {
        this.acks[id] = ack;
        return;
      }
      const timer = this.io.setTimeoutFn(() => {
        delete this.acks[id];
        for (let i = 0; i < this.sendBuffer.length; i++) {
          if (this.sendBuffer[i].id === id) {
            this.sendBuffer.splice(i, 1);
          }
        }
        ack.call(this, new Error("operation has timed out"));
      }, timeout);
      const fn = (...args) => {
        this.io.clearTimeoutFn(timer);
        ack.apply(this, args);
      };
      fn.withError = true;
      this.acks[id] = fn;
    }
    /**
     * Emits an event and waits for an acknowledgement
     *
     * @example
     * // without timeout
     * const response = await socket.emitWithAck("hello", "world");
     *
     * // with a specific timeout
     * try {
     *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
     * } catch (err) {
     *   // the server did not acknowledge the event in the given delay
     * }
     *
     * @return a Promise that will be fulfilled when the server acknowledges the event
     */
    emitWithAck(ev, ...args) {
      return new Promise((resolve, reject) => {
        const fn = (arg1, arg2) => {
          return arg1 ? reject(arg1) : resolve(arg2);
        };
        fn.withError = true;
        args.push(fn);
        this.emit(ev, ...args);
      });
    }
    /**
     * Add the packet to the queue.
     * @param args
     * @private
     */
    _addToQueue(args) {
      let ack;
      if (typeof args[args.length - 1] === "function") {
        ack = args.pop();
      }
      const packet = {
        id: this._queueSeq++,
        tryCount: 0,
        pending: false,
        args,
        flags: Object.assign({ fromQueue: true }, this.flags)
      };
      args.push((err, ...responseArgs) => {
        if (packet !== this._queue[0]) {
          return;
        }
        const hasError = err !== null;
        if (hasError) {
          if (packet.tryCount > this._opts.retries) {
            this._queue.shift();
            if (ack) {
              ack(err);
            }
          }
        } else {
          this._queue.shift();
          if (ack) {
            ack(null, ...responseArgs);
          }
        }
        packet.pending = false;
        return this._drainQueue();
      });
      this._queue.push(packet);
      this._drainQueue();
    }
    /**
     * Send the first packet of the queue, and wait for an acknowledgement from the server.
     * @param force - whether to resend a packet that has not been acknowledged yet
     *
     * @private
     */
    _drainQueue(force = false) {
      if (!this.connected || this._queue.length === 0) {
        return;
      }
      const packet = this._queue[0];
      if (packet.pending && !force) {
        return;
      }
      packet.pending = true;
      packet.tryCount++;
      this.flags = packet.flags;
      this.emit.apply(this, packet.args);
    }
    /**
     * Sends a packet.
     *
     * @param packet
     * @private
     */
    packet(packet) {
      packet.nsp = this.nsp;
      this.io._packet(packet);
    }
    /**
     * Called upon engine `open`.
     *
     * @private
     */
    onopen() {
      if (typeof this.auth == "function") {
        this.auth((data) => {
          this._sendConnectPacket(data);
        });
      } else {
        this._sendConnectPacket(this.auth);
      }
    }
    /**
     * Sends a CONNECT packet to initiate the Socket.IO session.
     *
     * @param data
     * @private
     */
    _sendConnectPacket(data) {
      this.packet({
        type: PacketType.CONNECT,
        data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data) : data
      });
    }
    /**
     * Called upon engine or manager `error`.
     *
     * @param err
     * @private
     */
    onerror(err) {
      if (!this.connected) {
        this.emitReserved("connect_error", err);
      }
    }
    /**
     * Called upon engine `close`.
     *
     * @param reason
     * @param description
     * @private
     */
    onclose(reason, description) {
      this.connected = false;
      delete this.id;
      this.emitReserved("disconnect", reason, description);
      this._clearAcks();
    }
    /**
     * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
     * the server.
     *
     * @private
     */
    _clearAcks() {
      Object.keys(this.acks).forEach((id) => {
        const isBuffered = this.sendBuffer.some((packet) => String(packet.id) === id);
        if (!isBuffered) {
          const ack = this.acks[id];
          delete this.acks[id];
          if (ack.withError) {
            ack.call(this, new Error("socket has been disconnected"));
          }
        }
      });
    }
    /**
     * Called with socket packet.
     *
     * @param packet
     * @private
     */
    onpacket(packet) {
      const sameNamespace = packet.nsp === this.nsp;
      if (!sameNamespace)
        return;
      switch (packet.type) {
        case PacketType.CONNECT:
          if (packet.data && packet.data.sid) {
            this.onconnect(packet.data.sid, packet.data.pid);
          } else {
            this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
          }
          break;
        case PacketType.EVENT:
        case PacketType.BINARY_EVENT:
          this.onevent(packet);
          break;
        case PacketType.ACK:
        case PacketType.BINARY_ACK:
          this.onack(packet);
          break;
        case PacketType.DISCONNECT:
          this.ondisconnect();
          break;
        case PacketType.CONNECT_ERROR:
          this.destroy();
          const err = new Error(packet.data.message);
          err.data = packet.data.data;
          this.emitReserved("connect_error", err);
          break;
      }
    }
    /**
     * Called upon a server event.
     *
     * @param packet
     * @private
     */
    onevent(packet) {
      const args = packet.data || [];
      if (null != packet.id) {
        args.push(this.ack(packet.id));
      }
      if (this.connected) {
        this.emitEvent(args);
      } else {
        this.receiveBuffer.push(Object.freeze(args));
      }
    }
    emitEvent(args) {
      if (this._anyListeners && this._anyListeners.length) {
        const listeners = this._anyListeners.slice();
        for (const listener of listeners) {
          listener.apply(this, args);
        }
      }
      super.emit.apply(this, args);
      if (this._pid && args.length && typeof args[args.length - 1] === "string") {
        this._lastOffset = args[args.length - 1];
      }
    }
    /**
     * Produces an ack callback to emit with an event.
     *
     * @private
     */
    ack(id) {
      const self2 = this;
      let sent = false;
      return function(...args) {
        if (sent)
          return;
        sent = true;
        self2.packet({
          type: PacketType.ACK,
          id,
          data: args
        });
      };
    }
    /**
     * Called upon a server acknowledgement.
     *
     * @param packet
     * @private
     */
    onack(packet) {
      const ack = this.acks[packet.id];
      if (typeof ack !== "function") {
        return;
      }
      delete this.acks[packet.id];
      if (ack.withError) {
        packet.data.unshift(null);
      }
      ack.apply(this, packet.data);
    }
    /**
     * Called upon server connect.
     *
     * @private
     */
    onconnect(id, pid) {
      this.id = id;
      this.recovered = pid && this._pid === pid;
      this._pid = pid;
      this.connected = true;
      this.emitBuffered();
      this.emitReserved("connect");
      this._drainQueue(true);
    }
    /**
     * Emit buffered events (received and emitted).
     *
     * @private
     */
    emitBuffered() {
      this.receiveBuffer.forEach((args) => this.emitEvent(args));
      this.receiveBuffer = [];
      this.sendBuffer.forEach((packet) => {
        this.notifyOutgoingListeners(packet);
        this.packet(packet);
      });
      this.sendBuffer = [];
    }
    /**
     * Called upon server disconnect.
     *
     * @private
     */
    ondisconnect() {
      this.destroy();
      this.onclose("io server disconnect");
    }
    /**
     * Called upon forced client/server side disconnections,
     * this method ensures the manager stops tracking us and
     * that reconnections don't get triggered for this.
     *
     * @private
     */
    destroy() {
      if (this.subs) {
        this.subs.forEach((subDestroy) => subDestroy());
        this.subs = void 0;
      }
      this.io["_destroy"](this);
    }
    /**
     * Disconnects the socket manually. In that case, the socket will not try to reconnect.
     *
     * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
     *
     * @example
     * const socket = io();
     *
     * socket.on("disconnect", (reason) => {
     *   // console.log(reason); prints "io client disconnect"
     * });
     *
     * socket.disconnect();
     *
     * @return self
     */
    disconnect() {
      if (this.connected) {
        this.packet({ type: PacketType.DISCONNECT });
      }
      this.destroy();
      if (this.connected) {
        this.onclose("io client disconnect");
      }
      return this;
    }
    /**
     * Alias for {@link disconnect()}.
     *
     * @return self
     */
    close() {
      return this.disconnect();
    }
    /**
     * Sets the compress flag.
     *
     * @example
     * socket.compress(false).emit("hello");
     *
     * @param compress - if `true`, compresses the sending data
     * @return self
     */
    compress(compress) {
      this.flags.compress = compress;
      return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
     * ready to send messages.
     *
     * @example
     * socket.volatile.emit("hello"); // the server may or may not receive it
     *
     * @returns self
     */
    get volatile() {
      this.flags.volatile = true;
      return this;
    }
    /**
     * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
     * given number of milliseconds have elapsed without an acknowledgement from the server:
     *
     * @example
     * socket.timeout(5000).emit("my-event", (err) => {
     *   if (err) {
     *     // the server did not acknowledge the event in the given delay
     *   }
     * });
     *
     * @returns self
     */
    timeout(timeout) {
      this.flags.timeout = timeout;
      return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * @example
     * socket.onAny((event, ...args) => {
     *   console.log(`got ${event}`);
     * });
     *
     * @param listener
     */
    onAny(listener) {
      this._anyListeners = this._anyListeners || [];
      this._anyListeners.push(listener);
      return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * @example
     * socket.prependAny((event, ...args) => {
     *   console.log(`got event ${event}`);
     * });
     *
     * @param listener
     */
    prependAny(listener) {
      this._anyListeners = this._anyListeners || [];
      this._anyListeners.unshift(listener);
      return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`got event ${event}`);
     * }
     *
     * socket.onAny(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAny(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAny();
     *
     * @param listener
     */
    offAny(listener) {
      if (!this._anyListeners) {
        return this;
      }
      if (listener) {
        const listeners = this._anyListeners;
        for (let i = 0; i < listeners.length; i++) {
          if (listener === listeners[i]) {
            listeners.splice(i, 1);
            return this;
          }
        }
      } else {
        this._anyListeners = [];
      }
      return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */
    listenersAny() {
      return this._anyListeners || [];
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.onAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */
    onAnyOutgoing(listener) {
      this._anyOutgoingListeners = this._anyOutgoingListeners || [];
      this._anyOutgoingListeners.push(listener);
      return this;
    }
    /**
     * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
     * callback. The listener is added to the beginning of the listeners array.
     *
     * Note: acknowledgements sent to the server are not included.
     *
     * @example
     * socket.prependAnyOutgoing((event, ...args) => {
     *   console.log(`sent event ${event}`);
     * });
     *
     * @param listener
     */
    prependAnyOutgoing(listener) {
      this._anyOutgoingListeners = this._anyOutgoingListeners || [];
      this._anyOutgoingListeners.unshift(listener);
      return this;
    }
    /**
     * Removes the listener that will be fired when any event is emitted.
     *
     * @example
     * const catchAllListener = (event, ...args) => {
     *   console.log(`sent event ${event}`);
     * }
     *
     * socket.onAnyOutgoing(catchAllListener);
     *
     * // remove a specific listener
     * socket.offAnyOutgoing(catchAllListener);
     *
     * // or remove all listeners
     * socket.offAnyOutgoing();
     *
     * @param [listener] - the catch-all listener (optional)
     */
    offAnyOutgoing(listener) {
      if (!this._anyOutgoingListeners) {
        return this;
      }
      if (listener) {
        const listeners = this._anyOutgoingListeners;
        for (let i = 0; i < listeners.length; i++) {
          if (listener === listeners[i]) {
            listeners.splice(i, 1);
            return this;
          }
        }
      } else {
        this._anyOutgoingListeners = [];
      }
      return this;
    }
    /**
     * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
     * e.g. to remove listeners.
     */
    listenersAnyOutgoing() {
      return this._anyOutgoingListeners || [];
    }
    /**
     * Notify the listeners for each packet sent
     *
     * @param packet
     *
     * @private
     */
    notifyOutgoingListeners(packet) {
      if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
        const listeners = this._anyOutgoingListeners.slice();
        for (const listener of listeners) {
          listener.apply(this, packet.data);
        }
      }
    }
  };
  function Backoff(opts) {
    opts = opts || {};
    this.ms = opts.min || 100;
    this.max = opts.max || 1e4;
    this.factor = opts.factor || 2;
    this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
    this.attempts = 0;
  }
  Backoff.prototype.duration = function() {
    var ms = this.ms * Math.pow(this.factor, this.attempts++);
    if (this.jitter) {
      var rand = Math.random();
      var deviation = Math.floor(rand * this.jitter * ms);
      ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
    }
    return Math.min(ms, this.max) | 0;
  };
  Backoff.prototype.reset = function() {
    this.attempts = 0;
  };
  Backoff.prototype.setMin = function(min) {
    this.ms = min;
  };
  Backoff.prototype.setMax = function(max) {
    this.max = max;
  };
  Backoff.prototype.setJitter = function(jitter) {
    this.jitter = jitter;
  };
  var Manager = class extends Emitter {
    constructor(uri, opts) {
      var _a;
      super();
      this.nsps = {};
      this.subs = [];
      if (uri && "object" === typeof uri) {
        opts = uri;
        uri = void 0;
      }
      opts = opts || {};
      opts.path = opts.path || "/socket.io";
      this.opts = opts;
      installTimerFunctions(this, opts);
      this.reconnection(opts.reconnection !== false);
      this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
      this.reconnectionDelay(opts.reconnectionDelay || 1e3);
      this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
      this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
      this.backoff = new Backoff({
        min: this.reconnectionDelay(),
        max: this.reconnectionDelayMax(),
        jitter: this.randomizationFactor()
      });
      this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
      this._readyState = "closed";
      this.uri = uri;
      const _parser = opts.parser || esm_exports;
      this.encoder = new _parser.Encoder();
      this.decoder = new _parser.Decoder();
      this._autoConnect = opts.autoConnect !== false;
      if (this._autoConnect)
        this.open();
    }
    reconnection(v) {
      if (!arguments.length)
        return this._reconnection;
      this._reconnection = !!v;
      if (!v) {
        this.skipReconnect = true;
      }
      return this;
    }
    reconnectionAttempts(v) {
      if (v === void 0)
        return this._reconnectionAttempts;
      this._reconnectionAttempts = v;
      return this;
    }
    reconnectionDelay(v) {
      var _a;
      if (v === void 0)
        return this._reconnectionDelay;
      this._reconnectionDelay = v;
      (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
      return this;
    }
    randomizationFactor(v) {
      var _a;
      if (v === void 0)
        return this._randomizationFactor;
      this._randomizationFactor = v;
      (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
      return this;
    }
    reconnectionDelayMax(v) {
      var _a;
      if (v === void 0)
        return this._reconnectionDelayMax;
      this._reconnectionDelayMax = v;
      (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
      return this;
    }
    timeout(v) {
      if (!arguments.length)
        return this._timeout;
      this._timeout = v;
      return this;
    }
    /**
     * Starts trying to reconnect if reconnection is enabled and we have not
     * started reconnecting yet
     *
     * @private
     */
    maybeReconnectOnOpen() {
      if (!this._reconnecting && this._reconnection && this.backoff.attempts === 0) {
        this.reconnect();
      }
    }
    /**
     * Sets the current transport `socket`.
     *
     * @param {Function} fn - optional, callback
     * @return self
     * @public
     */
    open(fn) {
      if (~this._readyState.indexOf("open"))
        return this;
      this.engine = new Socket(this.uri, this.opts);
      const socket = this.engine;
      const self2 = this;
      this._readyState = "opening";
      this.skipReconnect = false;
      const openSubDestroy = on(socket, "open", function() {
        self2.onopen();
        fn && fn();
      });
      const onError = (err) => {
        this.cleanup();
        this._readyState = "closed";
        this.emitReserved("error", err);
        if (fn) {
          fn(err);
        } else {
          this.maybeReconnectOnOpen();
        }
      };
      const errorSub = on(socket, "error", onError);
      if (false !== this._timeout) {
        const timeout = this._timeout;
        const timer = this.setTimeoutFn(() => {
          openSubDestroy();
          onError(new Error("timeout"));
          socket.close();
        }, timeout);
        if (this.opts.autoUnref) {
          timer.unref();
        }
        this.subs.push(() => {
          this.clearTimeoutFn(timer);
        });
      }
      this.subs.push(openSubDestroy);
      this.subs.push(errorSub);
      return this;
    }
    /**
     * Alias for open()
     *
     * @return self
     * @public
     */
    connect(fn) {
      return this.open(fn);
    }
    /**
     * Called upon transport open.
     *
     * @private
     */
    onopen() {
      this.cleanup();
      this._readyState = "open";
      this.emitReserved("open");
      const socket = this.engine;
      this.subs.push(
        on(socket, "ping", this.onping.bind(this)),
        on(socket, "data", this.ondata.bind(this)),
        on(socket, "error", this.onerror.bind(this)),
        on(socket, "close", this.onclose.bind(this)),
        // @ts-ignore
        on(this.decoder, "decoded", this.ondecoded.bind(this))
      );
    }
    /**
     * Called upon a ping.
     *
     * @private
     */
    onping() {
      this.emitReserved("ping");
    }
    /**
     * Called with data.
     *
     * @private
     */
    ondata(data) {
      try {
        this.decoder.add(data);
      } catch (e) {
        this.onclose("parse error", e);
      }
    }
    /**
     * Called when parser fully decodes a packet.
     *
     * @private
     */
    ondecoded(packet) {
      nextTick(() => {
        this.emitReserved("packet", packet);
      }, this.setTimeoutFn);
    }
    /**
     * Called upon socket error.
     *
     * @private
     */
    onerror(err) {
      this.emitReserved("error", err);
    }
    /**
     * Creates a new socket for the given `nsp`.
     *
     * @return {Socket}
     * @public
     */
    socket(nsp, opts) {
      let socket = this.nsps[nsp];
      if (!socket) {
        socket = new Socket2(this, nsp, opts);
        this.nsps[nsp] = socket;
      } else if (this._autoConnect && !socket.active) {
        socket.connect();
      }
      return socket;
    }
    /**
     * Called upon a socket close.
     *
     * @param socket
     * @private
     */
    _destroy(socket) {
      const nsps = Object.keys(this.nsps);
      for (const nsp of nsps) {
        const socket2 = this.nsps[nsp];
        if (socket2.active) {
          return;
        }
      }
      this._close();
    }
    /**
     * Writes a packet.
     *
     * @param packet
     * @private
     */
    _packet(packet) {
      const encodedPackets = this.encoder.encode(packet);
      for (let i = 0; i < encodedPackets.length; i++) {
        this.engine.write(encodedPackets[i], packet.options);
      }
    }
    /**
     * Clean up transport subscriptions and packet buffer.
     *
     * @private
     */
    cleanup() {
      this.subs.forEach((subDestroy) => subDestroy());
      this.subs.length = 0;
      this.decoder.destroy();
    }
    /**
     * Close the current socket.
     *
     * @private
     */
    _close() {
      this.skipReconnect = true;
      this._reconnecting = false;
      this.onclose("forced close");
    }
    /**
     * Alias for close()
     *
     * @private
     */
    disconnect() {
      return this._close();
    }
    /**
     * Called when:
     *
     * - the low-level engine is closed
     * - the parser encountered a badly formatted packet
     * - all sockets are disconnected
     *
     * @private
     */
    onclose(reason, description) {
      var _a;
      this.cleanup();
      (_a = this.engine) === null || _a === void 0 ? void 0 : _a.close();
      this.backoff.reset();
      this._readyState = "closed";
      this.emitReserved("close", reason, description);
      if (this._reconnection && !this.skipReconnect) {
        this.reconnect();
      }
    }
    /**
     * Attempt a reconnection.
     *
     * @private
     */
    reconnect() {
      if (this._reconnecting || this.skipReconnect)
        return this;
      const self2 = this;
      if (this.backoff.attempts >= this._reconnectionAttempts) {
        this.backoff.reset();
        this.emitReserved("reconnect_failed");
        this._reconnecting = false;
      } else {
        const delay = this.backoff.duration();
        this._reconnecting = true;
        const timer = this.setTimeoutFn(() => {
          if (self2.skipReconnect)
            return;
          this.emitReserved("reconnect_attempt", self2.backoff.attempts);
          if (self2.skipReconnect)
            return;
          self2.open((err) => {
            if (err) {
              self2._reconnecting = false;
              self2.reconnect();
              this.emitReserved("reconnect_error", err);
            } else {
              self2.onreconnect();
            }
          });
        }, delay);
        if (this.opts.autoUnref) {
          timer.unref();
        }
        this.subs.push(() => {
          this.clearTimeoutFn(timer);
        });
      }
    }
    /**
     * Called upon successful reconnect.
     *
     * @private
     */
    onreconnect() {
      const attempt = this.backoff.attempts;
      this._reconnecting = false;
      this.backoff.reset();
      this.emitReserved("reconnect", attempt);
    }
  };
  var cache = {};
  function lookup2(uri, opts) {
    if (typeof uri === "object") {
      opts = uri;
      uri = void 0;
    }
    opts = opts || {};
    const parsed = url(uri, opts.path || "/socket.io");
    const source = parsed.source;
    const id = parsed.id;
    const path = parsed.path;
    const sameNamespace = cache[id] && path in cache[id]["nsps"];
    const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
    let io;
    if (newConnection) {
      io = new Manager(source, opts);
    } else {
      if (!cache[id]) {
        cache[id] = new Manager(source, opts);
      }
      io = cache[id];
    }
    if (parsed.query && !opts.query) {
      opts.query = parsed.queryKey;
    }
    return io.socket(parsed.path, opts);
  }
  Object.assign(lookup2, {
    Manager,
    Socket: Socket2,
    io: lookup2,
    connect: lookup2
  });
  var SignalServer = class {
    params;
    socket;
    connected;
    rooms;
    onMessage;
    onConnect;
    onDisconnect;
    onJoinRoom;
    onLeaveRoom;
    constructor(params) {
      this.params = params;
      this.connected = false;
      this.rooms = /* @__PURE__ */ new Set();
    }
    start() {
      this.socket = lookup2(this.params.host);
      this.socket.on("connect", () => {
        this.connected = true;
        if (this.onConnect) {
          this.onConnect();
        }
      });
      this.socket.on("message", (e) => {
        if (this.onMessage) {
          this.onMessage(e.target, e.data.message);
        }
      });
      this.socket.on("join-room", (e) => {
        if (e.target == this.socket.id) {
          this.rooms.add(e.data.room);
        }
        if (this.onJoinRoom) {
          this.onJoinRoom(e.target, e.data.room);
        }
      });
      this.socket.on("leave-room", (e) => {
        if (e.target == this.socket.id) {
          this.rooms.delete(e.data.room);
        }
        if (this.onLeaveRoom) {
          this.onLeaveRoom(e.target, e.data.room);
        }
      });
      this.socket.on("disconnect", () => {
        this.connected = false;
        if (this.onDisconnect) {
          this.onDisconnect();
        }
      });
    }
    sendMessage(to, message) {
      this.socket.emit("message", {
        emitType: "single",
        message,
        to
      });
    }
    broadcastMessage(message, rooms = []) {
      this.socket.emit("message", {
        emitType: "broadcast",
        message,
        rooms
      });
    }
    joinRoom(room) {
      this.socket.emit("room", {
        action: "join",
        room
      });
    }
    leaveRoom(room) {
      this.socket.emit("room", {
        action: "leave",
        room
      });
    }
  };
  var ChannelClientController = class extends Component {
    _refreshRate;
    _channelClient;
    _interval;
    constructor(params) {
      super();
      this._refreshRate = params.refreshRate ?? 1e3 / 30;
      this._channelClient = new ChannelClient(new SignalServer({ host: params.host }), params.rtcConfig);
    }
    start() {
      this._channelClient.onConnect = () => {
        this.broadcast({ topic: "connect" });
      };
      this._channelClient.onDisconnect = () => {
        this.broadcast({ topic: "disconnect" });
      };
      this._channelClient.onMessage = (client, data) => {
        data = JSON.parse(data);
        switch (data.type) {
          case "data":
            this.broadcast({ topic: "data", data: data.data });
            break;
          case "join":
            this.broadcast({ topic: "join", socketId: data.socketId });
            break;
          case "leave":
            this.broadcast({ topic: "leave", socketId: data.socketId });
            break;
        }
      };
      this._interval = setInterval(() => this._updateEntity(), this._refreshRate);
      this._channelClient.connect();
    }
    destroy() {
      if (this._interval) {
        clearInterval(this._interval);
      }
    }
    _updateEntity() {
      if (!this._channelClient.channel.ready) {
        return;
      }
      this._channelClient.channel.send(JSON.stringify(this._entity.getComponent("Serializer").serialize()));
    }
  };
  var ChannelServerConnection = class {
    socketId;
    server;
    localConnection;
    channel;
    constructor(socketId, server) {
      this.socketId = socketId;
      this.server = server;
      this.localConnection = new RTCPeerConnection(server.rtcConfig);
      this.localConnection.onicecandidate = (e) => {
        server.signalServer.sendMessage(socketId, {
          type: "candidate",
          candidate: e.candidate
        });
      };
      const dataChannel = this.localConnection.createDataChannel("main");
      this.channel = new Channel(dataChannel);
      this.channel.init();
      this.channel.onConnect = () => {
        if (server.onConnect) {
          server.onConnect(this);
        }
      };
      this.channel.onDisconnect = () => {
        server.removeConnection(this);
        if (server.onDisconnect) {
          server.onDisconnect(this);
        }
      };
      this.channel.onMessage = (data) => {
        if (server.onMessage) {
          server.onMessage(this, data);
        }
      };
      this.localConnection.createOffer().then((offer) => this.localConnection.setLocalDescription(offer)).then(() => {
        server.signalServer.sendMessage(socketId, {
          type: "offer",
          offer: this.localConnection.localDescription
        });
      });
    }
    handleSignalMessage(message) {
      console.log("Server: Message type " + message.type + " received [" + this.socketId + "]");
      switch (message.type) {
        case "answer":
          this.localConnection.setRemoteDescription(message.answer);
          break;
        case "candidate":
          this.localConnection.addIceCandidate(message.candidate);
          break;
      }
    }
    get connected() {
      return this.channel.ready;
    }
  };
  var ChannelServer = class {
    serverRoom;
    signalServer;
    rtcConfig;
    connections;
    onStart;
    onConnect;
    onDisconnect;
    onMessage;
    constructor(serverRoom, signalServer, rtcConfig) {
      this.serverRoom = serverRoom;
      this.signalServer = signalServer;
      this.rtcConfig = rtcConfig;
      this.connections = [];
      signalServer.onConnect = () => {
        console.log("Server: Signal server connected with socket [" + signalServer.socket.id + "]");
        signalServer.joinRoom(serverRoom);
        if (this.onStart) {
          this.onStart();
        }
      };
      signalServer.onJoinRoom = (target, room) => {
        if (signalServer.socket.id == target || room != this.serverRoom) {
          return;
        }
        console.log("Server: Socket [" + target + "] joined server room");
        this.createConnection(target);
      };
      signalServer.onLeaveRoom = (target, room) => {
        if (signalServer.socket.id == target || room != this.serverRoom) {
          return;
        }
        console.log("Server: Socket [" + target + "] left server room");
        const connection = this.connections.find((connection2) => connection2.socketId == target);
        if (connection) {
          connection.localConnection.close();
        }
      };
      signalServer.onMessage = (from, message) => {
        const connection = this.connections.find((connection2) => connection2.socketId == from);
        if (connection) {
          connection.handleSignalMessage(message);
        }
      };
    }
    connect() {
      this.signalServer.start();
    }
    createConnection(socketId) {
      const connection = new ChannelServerConnection(socketId, this);
      this.connections.push(connection);
    }
    removeConnection(conn) {
      this.connections.splice(this.connections.indexOf(conn), 1);
    }
  };
  var ChannelServerController = class extends Component {
    _running;
    _refreshRate;
    _channelServer;
    _interval;
    _entityData;
    constructor(params) {
      super();
      this._refreshRate = params.refreshRate ?? 1e3 / 30;
      this._entityData = [];
      this._running = false;
      this._channelServer = new ChannelServer(params.room, new SignalServer({
        host: params.host
      }), params.rtcConfig);
    }
    start() {
      this._channelServer.onStart = () => {
        this._running = true;
      };
      this._channelServer.onConnect = (connection) => {
        const entityData = { socketId: connection.socketId };
        this._entityData.push(entityData);
        this._sendTextDataToAll({
          type: "join",
          socketId: connection.socketId
        });
      };
      this._channelServer.onDisconnect = (connection) => {
        const entityData = this._entityData.find((item) => item.socketId == connection.socketId);
        this._entityData.splice(this._entityData.indexOf(entityData), 1);
        this._sendTextDataToAll({
          type: "leave",
          socketId: connection.socketId
        });
      };
      this._channelServer.onMessage = (connection, data) => {
        const entityData = this._entityData.find((item) => item.socketId == connection.socketId);
        if (entityData) {
          entityData.data = JSON.parse(data);
        }
      };
      this._channelServer.connect();
      this._interval = setInterval(() => {
        this._updateEntities();
      }, this._refreshRate);
    }
    destroy() {
      this._running = false;
      if (this._interval) {
        clearInterval(this._interval);
      }
    }
    _updateEntities() {
      if (!this._running) {
        return;
      }
      this._sendTextDataToAll({
        type: "data",
        data: this._entityData
      });
    }
    _sendTextData(connection, data) {
      connection.channel.send(JSON.stringify(data));
    }
    _sendTextDataToAll(data) {
      for (let connection of this._channelServer.connections) {
        if (!connection.connected) {
          continue;
        }
        this._sendTextData(connection, data);
      }
    }
  };
  var Transform = class extends Component {
    constructor() {
      super();
      this._parent = null;
      this._children = /* @__PURE__ */ new Set();
      this._position = new Vector();
      this._scale = new Vector(1, 1);
    }
    get position() {
      return this._position;
    }
    set position(p) {
      this._position.copy(p);
    }
    get scale() {
      return this._scale;
    }
    set scale(s) {
      this._scale.copy(s);
    }
    getWorldPosition() {
      if (this._parent) {
        return this._parent.getWorldPosition().add(this._position);
      } else {
        return this._position.clone();
      }
    }
    setParent(parent) {
      if (this._parent) {
        this._position.add(this._parent.getWorldPosition());
      }
      if (parent) {
        this._position.sub(parent.getWorldPosition());
      }
      this._parent = parent;
    }
  };
  var Entity = class _Entity {
    static _ids = 0;
    static genName() {
      return "_entity_" + this._ids++;
    }
    constructor(n) {
      if (typeof n == "undefined") {
        this._name = _Entity.genName();
      } else {
        this._name = n;
      }
      this._groups = /* @__PURE__ */ new Set();
      this._componentsMap = /* @__PURE__ */ new Map();
      this._components = [];
      this._scene = null;
      this._transform = new Transform();
      this._handlers = {};
      this.addComponent("Transform", this._transform);
    }
    get name() {
      return this._name;
    }
    get groups() {
      return this._groups;
    }
    get transform() {
      return this._transform;
    }
    addComponent(name, component) {
      component._entity = this;
      this._componentsMap.set(name, component);
      this._components.push(component);
      return component;
    }
    getComponent(n) {
      return this._componentsMap.get(n);
    }
    start() {
      for (let i = 0; i < this._components.length; ++i) {
        this._components[i].start();
      }
    }
    update(dt) {
      for (let i = 0; i < this._components.length; ++i) {
        this._components[i].update(dt);
      }
    }
    destroy() {
      for (let i = 0; i < this._components.length; ++i) {
        this._components[i].destroy();
      }
    }
    registerHandler(name, handler) {
      if (!(name in this._handlers)) {
        this._handlers[name] = [];
      }
      this._handlers[name].push(handler);
    }
    broadcast(msg) {
      if (!(msg.topic in this._handlers)) {
        return;
      }
      for (let curHandler of this._handlers[msg.topic]) {
        curHandler(msg);
      }
    }
  };
  var EntityManager = class {
    constructor() {
      this._entities = [];
      this._entityMap = /* @__PURE__ */ new Map();
    }
    add(e) {
      this._entities.push(e);
      this._entityMap.set(e.name, e);
    }
    get(n) {
      return this._entityMap.get(n);
    }
    remove(e) {
      const idx = this._entities.indexOf(e);
      this._entities.splice(idx, 1);
      this._entityMap.delete(e.name);
    }
  };
  var camera = /* @__PURE__ */ function() {
    class Camera extends Component {
      constructor(params) {
        super();
        this._viewport = params.viewport;
        this._wcWidth = params.wcWidth;
        this._projectionM = Matrix.create();
        this._viewM = Matrix.create();
        this._projectionViewM = Matrix.create();
      }
      get viewport() {
        return this._viewport;
      }
      set viewport(vp) {
        this._viewport = vp;
      }
      get projection() {
        return this._projectionM;
      }
      get view() {
        return this._viewM;
      }
      get projectionView() {
        return this._projectionViewM;
      }
      getBoundingRect() {
        const width = this._wcWidth / this._entity.transform.scale.x, height = this._getWCHeight() / this._entity.transform.scale.y;
        const p = this._entity.transform.position;
        return { x: p.x - width / 2, y: p.y - height / 2, width, height };
      }
      update() {
        const halfW = this._wcWidth * 0.5 / this._entity.transform.scale.x, halfH = this._getWCHeight() * 0.5 / this._entity.transform.scale.y;
        Matrix.ortho(this._projectionM, -halfW, halfW, halfH, -halfH, 0, 100);
        this._viewM[12] = -this._entity.transform.position.x;
        this._viewM[13] = -this._entity.transform.position.y;
        Matrix.multiply(this._projectionViewM, this._projectionM, this._viewM);
      }
      /**
       * 
       * @param {WebGL2RenderingContext} gl 
       */
      begin(gl) {
        const x = this._viewport[0], y = gl.canvas.height - this._viewport[3] - this._viewport[1], w = this._viewport[2], h = this._viewport[3];
        gl.viewport(x, y, w, h);
      }
      _getWCHeight() {
        return this._wcWidth * this._viewport[3] / this._viewport[2];
      }
    }
    return {
      Camera
    };
  }();
  var Scene = class {
    _renderer;
    constructor() {
      this._started = false;
      this._entityManager = new EntityManager();
      this._pendingEntities = [];
      this._entitiesToRemove = [];
      this._camera = {};
    }
    get camera() {
      return this._camera;
    }
    get renderer() {
      return this._renderer;
    }
    init() {
    }
    createEntity(name) {
      const e = new Entity(name);
      if (this._started) {
        this._pendingEntities.push(e);
      } else {
        this._entityManager.add(e);
        e._scene = this;
      }
      return e;
    }
    removeEntity(e) {
      if (this._started) {
        this._entitiesToRemove.push(e);
      } else {
        this._entityManager.remove(e);
      }
    }
    getEntitiesByGroup(g) {
      return this._entityManager._entities.filter((e) => e.groups.has(g));
    }
    getEntityByName(n) {
      return this._entityManager.get(n);
    }
    createCamera(name, params) {
      const cam = this._camera[name] = new camera.Camera(params);
      const e = this.createEntity();
      e.addComponent("camera", cam);
      e.groups.add("camera");
      return cam;
    }
    start() {
      this._renderer.start();
      for (let i = 0; i < this._entityManager._entities.length; ++i) {
        this._entityManager._entities[i].start();
      }
      this._started = true;
    }
    update(dt) {
      for (let i = 0; i < this._entityManager._entities.length; ++i) {
        this._entityManager._entities[i].update(dt);
      }
      while (this._pendingEntities.length > 0) {
        const e = this._pendingEntities.pop();
        this._entityManager.add(e);
        e._scene = this;
        e.start();
      }
      while (this._entitiesToRemove.length > 0) {
        const e = this._entitiesToRemove.pop();
        e.destroy();
        this._entityManager.remove(e);
      }
    }
    render() {
      for (let attr in this._camera) {
        this._camera[attr].update();
      }
      this._renderer.render();
    }
    destroy() {
      for (let i = 0; i < this._entityManager._entities.length; ++i) {
        this._entityManager._entities[i].destroy();
      }
      this._started = false;
    }
  };
  var lancelot = /* @__PURE__ */ function() {
    class Lancelot {
      static _instance = null;
      _config;
      _canvas;
      _lastRAF;
      _dt;
      _accTime;
      _fpsCounter;
      _fps;
      _scene;
      constructor() {
        this._lastRAF = void 0;
        this._dt = 0;
        this._accTime = 0;
        this._fpsCounter = 0;
        this._fps = 0;
        this._scene = null;
      }
      static get config() {
        return this._get()._config;
      }
      static _get() {
        if (this._instance == null) {
          this._instance = new Lancelot();
        }
        return this._instance;
      }
      static async init(config) {
        const _this = this._get();
        _this._config = config;
        _this._canvas = new canvas.GLCanvas();
        config.container.appendChild(_this._canvas.domElement);
        _this._canvas.setViewportMode(config.viewportMode);
        _this._canvas.setSize(config.width, config.height);
        _this._canvas.start();
        KeyListener._get().start();
        await config.preload();
        this.changeScene(config.scene, config.sceneParams);
        _this._RAF();
      }
      static changeScene(scene, params) {
        const _this = this._get();
        if (_this._scene) {
          _this._scene.destroy();
        }
        scene._renderer = new renderer.Renderer(_this._canvas.context);
        scene.createCamera("main", {
          viewport: [0, 0, _this._config.width, _this._config.height],
          wcWidth: _this._config.width
        });
        scene.init(params);
        scene.start();
        _this._scene = scene;
      }
      update() {
        KeyListener._get().update();
        for (let tex of assets.AssetsManager._textures.values()) {
          tex.update(this._dt);
        }
        this._scene.update(this._dt);
      }
      render() {
        const gl = this._canvas.context;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        this._scene.renderer.render();
      }
      _RAF() {
        requestAnimationFrame((t) => {
          this._RAF();
          t *= 1e-3;
          this._dt = t - (this._lastRAF || t);
          this._dt = Math.min(this._dt, 1 / 20);
          this._lastRAF = t;
          this._accTime += this._dt;
          ++this._fpsCounter;
          if (this._accTime >= 1) {
            this._accTime = 0;
            this._fps = this._fpsCounter;
            this._fpsCounter = 0;
          }
          this.update();
          this.render();
        });
      }
    }
    return {
      Lancelot,
      Scene,
      Component,
      graphics: index_exports,
      utils: index_exports2,
      math: index_exports3,
      input: index_exports4,
      geometry: index_exports5,
      network: index_exports6
    };
  }();

  // script.js
  var { AssetsManager, loadImage } = lancelot.utils.assets;
  var { Vector: Vector2 } = lancelot.math;
  var { ChannelServerController: ChannelServerController2, ChannelClientController: ChannelClientController2 } = lancelot.network;
  var TILE_SIZE = 16;
  var TEST_ROOM = "GrottoTest";
  var SIGNAL_SERVER_HOST = "https://grotto-online.onrender.com";
  var REFRESH_RATE = 1e3 / 60;
  var RTC_CONFIG = {
    iceServers: [
      {
        urls: "stun:stun.relay.metered.ca:80"
      },
      {
        urls: "turn:global.relay.metered.ca:80",
        username: "2d1a7bde06e7419a33bccea0",
        credential: "z6QsgPyvDvCVUg0G"
      },
      {
        urls: "turn:global.relay.metered.ca:80?transport=tcp",
        username: "2d1a7bde06e7419a33bccea0",
        credential: "z6QsgPyvDvCVUg0G"
      },
      {
        urls: "turn:global.relay.metered.ca:443",
        username: "2d1a7bde06e7419a33bccea0",
        credential: "z6QsgPyvDvCVUg0G"
      },
      {
        urls: "turns:global.relay.metered.ca:443?transport=tcp",
        username: "2d1a7bde06e7419a33bccea0",
        credential: "z6QsgPyvDvCVUg0G"
      }
    ]
  };
  var PlayerSerializer = class extends lancelot.Component {
    serialize() {
      const controller = this.getComponent("controller");
      const playerData = {};
      playerData.position = this._entity.transform.position;
      playerData.velocity = controller._velocity;
      playerData.grounded = controller._grounded;
      playerData.climbing = controller._climbing;
      playerData.input = controller._input;
      playerData.slopes = controller._slopes;
      return playerData;
    }
    deserialize(data) {
      const controller = this.getComponent("controller");
      if (!controller._remoteFirstUpdate) {
        this._entity.transform.position.set(data.position.x, data.position.y);
      } else {
        this._entity.transform.position.lerp(new Vector2(data.position.x, data.position.y), 0.5);
      }
      controller._input = data.input;
      controller._velocity.copy(data.velocity);
      controller._grounded = data.grounded;
      controller._climbing = data.climbing;
      controller._slopes = data.slopes;
    }
  };
  var Mover = class extends lancelot.Component {
    constructor() {
      super();
      this._velocity = new Vector2();
      this._grounded = false;
      this._climbing = false;
      this._slopes = [];
    }
    updatePhysics(dt) {
      const moveDist = this._velocity.clone().scale(dt);
      this._grounded = false;
      this._entity.transform.position.x += moveDist.x;
      let collider = this.getComponent("collider");
      let tiles;
      collider.setPosition(this._entity.transform.position);
      let rect = collider.shape;
      let lastRect = collider.shape.clone();
      if (!this._slopes.length) {
        tiles = this._getTiles(
          new Vector2(rect.getLeft(), rect.getTop()),
          new Vector2(rect.getRight(), rect.getBottom())
        );
        tiles = tiles.filter((e) => e.tile && e.tile.getProperty("collide"));
        for (let tile of tiles) {
          this._collide(tile, moveDist.x < 0 ? "l" : "r", lastRect);
        }
      } else {
        for (let slope of this._slopes)
          this._updateSlope(slope);
      }
      this._entity.transform.position.y += moveDist.y;
      collider.setPosition(this._entity.transform.position);
      tiles = this._getTiles(
        new Vector2(rect.getLeft(), rect.getTop()),
        new Vector2(rect.getRight(), rect.getBottom())
      );
      tiles = tiles.filter((e) => e.tile && (e.tile.getProperty("collide") || this._isTopLedder(e) && !this._climbing));
      for (let tile of tiles) {
        this._collide(tile, moveDist.y < 0 ? "u" : "d", lastRect);
      }
    }
    _isTopLedder(tile) {
      const tilemap2 = this._entity._scene.getEntityByName("levelMap").getComponent("tilemap");
      let topTile = tilemap2.tilemap.getLayerByName("midground").getTile(tile.x, tile.y - 1);
      return tile.tile.getProperty("ledder") && (!topTile || topTile.tile && topTile.tile.getProperty("ledder") == false);
    }
    _getTiles(min, max) {
      let tiles = [];
      const tilemap2 = this._entity._scene.getEntityByName("levelMap").getComponent("tilemap");
      let x1 = ~~(min.x / tilemap2.tilemap.tilewidth), x2 = ~~(max.x / tilemap2.tilemap.tilewidth), y1 = ~~(min.y / tilemap2.tilemap.tileheight), y2 = ~~(max.y / tilemap2.tilemap.tileheight);
      let layers = tilemap2.tilemap.getLayers();
      let layer = layers.find((e) => e.name == "midground");
      for (let x = x1; x <= x2; ++x) {
        for (let y = y1; y <= y2; ++y) {
          tiles.push({ tile: layer.getTile(x, y), x, y });
        }
      }
      return tiles;
    }
    _updateSlope(t) {
      const tilemap2 = this._entity._scene.getEntityByName("levelMap").getComponent("tilemap");
      let layers = tilemap2.tilemap.getLayers();
      let layer = layers.find((e) => e.name == "midground");
      const tile = layer.getTile(t.x, t.y);
      let collider = this.getComponent("collider");
      let rect = collider.shape;
      let y1 = (t.y + 1 - tile.getProperty("y1")) * TILE_SIZE, y2 = (t.y + 1 - tile.getProperty("y2")) * TILE_SIZE, x1 = t.x * TILE_SIZE, x2 = (t.x + 1) * TILE_SIZE;
      if ((rect.getLeft() > x2 || rect.getRight() < x1) && (rect.getBottom() >= Math.max(y1, y2) || rect.getBottom() <= Math.min(y1, y2))) {
        let idx = this._slopes.findIndex((s) => s.x == t.x && s.y == t.y);
        this._slopes.splice(idx, 1);
        return;
      }
      let x = y1 < y2 ? rect.getLeft() : rect.getRight();
      let y = lancelot.math.math.map(y1, y2, x1, x2, lancelot.math.math.clamp(x, x1, x2));
      this._entity.transform.position.y = y - rect.height / 2;
      if (rect.getBottom() > y) {
        this._grounded = true;
        this._entity.transform.position.y = y - rect.height / 2;
        this._velocity.y = 0;
      }
    }
    _collide(t, direction, lastRect) {
      let collider = this.getComponent("collider");
      let rect = collider.shape;
      let tileRect = new lancelot.geometry.shape.Rect(TILE_SIZE, TILE_SIZE);
      tileRect.setPosition((t.x + 0.5) * TILE_SIZE, (t.y + 0.5) * TILE_SIZE);
      if (!rect.intersects(tileRect)) {
        return;
      }
      if (t.tile.getProperty("slope")) {
        if (direction != "d") {
          return;
        }
        let collider2 = this.getComponent("collider");
        let rect2 = collider2.shape;
        let y1 = (t.y + 1 - t.tile.getProperty("y1")) * TILE_SIZE, y2 = (t.y + 1 - t.tile.getProperty("y2")) * TILE_SIZE, x1 = t.x * TILE_SIZE, x2 = (t.x + 1) * TILE_SIZE;
        let x = y1 < y2 ? rect2.getLeft() : rect2.getRight();
        let y = lancelot.math.math.map(y1, y2, x1, x2, lancelot.math.math.clamp(x, x1, x2));
        if (rect2.getBottom() > y || this._slopes.length) {
          this._grounded = true;
          this._slopes.push({ x: t.x, y: t.y });
          if (rect2.getBottom() > y) {
            this._entity.transform.position.y = y - rect2.height / 2;
            this._velocity.y = 0;
          }
        }
      } else {
        switch (direction) {
          case "l":
            if (rect.getLeft() < tileRect.getRight()) {
              this._entity.transform.position.x = tileRect.getRight() + rect.width / 2;
              this._velocity.x = 0;
            }
            break;
          case "r":
            if (rect.getRight() > tileRect.getLeft()) {
              this._entity.transform.position.x = tileRect.getLeft() - rect.width / 2;
              this._velocity.x = 0;
            }
            break;
          case "u":
            if (!t.tile.getProperty("ledder") && rect.getTop() < tileRect.getBottom()) {
              this._entity.transform.position.y = tileRect.getBottom() + rect.height / 2;
              this._velocity.y = 0;
            }
            break;
          case "d":
            if (rect.getBottom() > tileRect.getTop() && (!t.tile.getProperty("ledder") || lastRect.getBottom() <= tileRect.getTop())) {
              this._grounded = true;
              this._entity.transform.position.y = tileRect.getTop() - rect.height / 2;
              this._velocity.y = 0;
            }
            break;
        }
      }
      collider.setPosition(this._entity.transform.position);
    }
  };
  var PlayerController = class extends Mover {
    constructor(params) {
      super();
      this._maxSpeed = 80;
      this._acceleration = 300;
      this._jumpForce = 95;
      this._climbingSpeed = 40;
      this._gravity = 180;
      this._idleClimbing = false;
      this._moving = false;
      this._input = {
        left: false,
        right: false,
        jump: false,
        up: false,
        down: false
      };
      this._ledders = [];
      this._justClimbed = 0;
      this._remote = params.remote ?? false;
      this._remoteFirstUpdate = false;
      this._roomCreated = false;
    }
    start() {
      const sprite = this.getComponent("sprite");
      sprite.playAnim(lancelot.graphics.Animations.get("player.idle"), true);
    }
    update(dt) {
      if (!this._remote) {
        this._updateInput();
      }
      this._moving = false;
      if (this._justClimbed > 0) --this._justClimbed;
      if (!(this._input.up || this._input.down) && this._input.jump && (this._grounded || this._climbing)) {
        this._grounded = false;
        this._climbing = false;
        this._slopes = [];
        this._velocity.y = -this._jumpForce * (Math.abs(this._velocity.x / this._maxSpeed) * 0.1 + 1);
      }
      let collider = this.getComponent("collider");
      collider.setPosition(this._entity.transform.position);
      let rect = collider.shape;
      if (this._climbing) {
        this._idleClimbing = true;
        let topLedderRectTop = Infinity;
        this._ledders.forEach((e) => {
          let tileRect = new lancelot.geometry.shape.Rect(TILE_SIZE, TILE_SIZE);
          tileRect.setPosition((e.x + 0.5) * TILE_SIZE, (e.y + 0.5) * TILE_SIZE);
          if (topLedderRectTop > tileRect.getTop()) {
            topLedderRectTop = tileRect.getTop();
          }
          return rect.intersects(tileRect);
        });
        this._ledders = this._getTiles(
          new Vector2(rect.getLeft() + rect.width / 2, rect.getTop()),
          new Vector2(rect.getRight() - rect.width / 2, rect.getBottom())
        ).filter((e) => {
          let tileRect = new lancelot.geometry.shape.Rect(TILE_SIZE, TILE_SIZE);
          tileRect.setPosition((e.x + 0.5) * 16, (e.y + 0.5) * TILE_SIZE);
          return e.tile && e.tile.getProperty("ledder");
        });
        if ((this._input.left || this._input.right) && !(this._input.up || this._input.down) || !this._ledders.length) {
          this._climbing = false;
          this._velocity.y = 0;
          if (this._input.up && !this._ledders.length) {
            this._entity.transform.position.y = topLedderRectTop - rect.height / 2;
            this._justClimbed = 2;
          }
        } else {
          if (this._input.up) {
            this._idleClimbing = false;
            this._velocity.y = -this._climbingSpeed;
          } else if (this._input.down) {
            this._idleClimbing = false;
            this._velocity.y = this._climbingSpeed;
            if (this._grounded) {
              this._climbing = false;
            }
          } else {
            this._velocity.y = 0;
          }
        }
      } else {
        if (this._input.left) {
          this._moving = true;
          this._velocity.x -= this._acceleration * dt;
        } else if (this._input.right) {
          this._moving = true;
          this._velocity.x += this._acceleration * dt;
        }
        if (this._input.up || this._input.down) {
          let tiles = this._getTiles(
            new Vector2(rect.getLeft() + rect.width / 2, rect.getTop()),
            new Vector2(rect.getRight() - rect.width / 2, rect.getBottom())
          );
          this._ledders = tiles.filter((e) => {
            let tileRect = new lancelot.geometry.shape.Rect(TILE_SIZE, TILE_SIZE);
            tileRect.setPosition((e.x + 0.5) * 16, (e.y + 0.5) * TILE_SIZE);
            return e.tile && e.tile.getProperty("ledder") && (this._input.up && tileRect.getTop() < rect.getBottom() || this._input.down && tileRect.getBottom() > rect.getBottom());
          });
          if (this._ledders.length) {
            this._climbing = true;
            this._velocity.x = 0;
            this._entity.transform.position.x = (this._ledders[0].x + 0.5) * TILE_SIZE;
          }
        }
        if (!this._moving) {
          this._velocity.x -= this._velocity.x * Math.min((this._grounded ? 10 : 2.5) * dt, 1);
        }
        if (Math.abs(this._velocity.x) > this._maxSpeed) {
          this._velocity.x = Math.sign(this._velocity.x) * this._maxSpeed;
        }
        this._velocity.y += this._gravity * dt;
      }
      this._updateSprite();
      this.updatePhysics(dt);
    }
    _updateSprite() {
      const sprite = this.getComponent("sprite");
      if (this._climbing || this._justClimbed > 0) {
        if (!sprite.isAnimPlaying("player.climb"))
          sprite.playAnim(lancelot.graphics.Animations.get("player.climb"), true);
        if (this._idleClimbing) {
          sprite.pauseAnim();
        } else {
          sprite.resumeAnim();
        }
      } else {
        if (this._input.left) {
          this._entity.transform.scale.x = -1;
        } else if (this._input.right) {
          this._entity.transform.scale.x = 1;
        }
        if (!this._grounded) {
          if (!sprite.isAnimPlaying("player.jump"))
            sprite.playAnim(lancelot.graphics.Animations.get("player.jump"), true);
        } else {
          if (this._moving) {
            if (!sprite.isAnimPlaying("player.run"))
              sprite.playAnim(lancelot.graphics.Animations.get("player.run"), true);
          } else {
            if (!sprite.isAnimPlaying("player.idle"))
              sprite.playAnim(lancelot.graphics.Animations.get("player.idle"), true);
          }
        }
      }
    }
    _updateInput() {
      if (!this._roomCreated && lancelot.input.KeyListener.isPressed("KeyK")) {
        this._createRoom();
      }
      if (lancelot.input.KeyListener.isPressed("KeyJ")) {
        this._joinRoom();
      }
      if (lancelot.input.KeyListener.isPressed("KeyL")) {
        this._leaveRoom();
      }
      this._input.left = lancelot.input.KeyListener.isDown("KeyA");
      this._input.right = lancelot.input.KeyListener.isDown("KeyD");
      this._input.up = lancelot.input.KeyListener.isDown("KeyW");
      this._input.down = lancelot.input.KeyListener.isDown("KeyS");
      this._input.jump = lancelot.input.KeyListener.isPressed("Space");
    }
    _joinRoom() {
      const client = this.getComponent("client");
      client._channelClient.joinRoom(TEST_ROOM);
    }
    _leaveRoom() {
      const client = this.getComponent("client");
      client._channelClient.leaveRoom();
    }
    _createRoom() {
      const serverEntity = this._entity._scene.createEntity("server");
      serverEntity.addComponent("server", new ChannelServerController2({
        room: TEST_ROOM,
        host: SIGNAL_SERVER_HOST,
        refreshRate: REFRESH_RATE,
        rtcConfig: RTC_CONFIG
      }));
      this._roomCreated = true;
    }
  };
  var CameraControler = class extends lancelot.Component {
    update(dt) {
      const player = this._entity._scene.getEntityByName("player");
      this._entity.transform.position.lerp(player.transform.position, Math.min(dt * 4, 1));
      const tilemap2 = this._entity._scene.getEntityByName("levelMap").getComponent("tilemap");
      const camera2 = this._entity.getComponent("camera");
      const bounds = camera2.getBoundingRect();
      if (bounds.x + bounds.width > tilemap2.tilemap.width * tilemap2.tilemap.tilewidth) {
        this._entity.transform.position.x = tilemap2.tilemap.width * tilemap2.tilemap.tilewidth - bounds.width / 2;
      } else if (bounds.x < 0) {
        this._entity.transform.position.x = bounds.width / 2;
      }
      if (bounds.y + bounds.height > tilemap2.tilemap.height * tilemap2.tilemap.tileheight) {
        this._entity.transform.position.y = tilemap2.tilemap.height * tilemap2.tilemap.tileheight - bounds.height / 2;
      } else if (bounds.y < 0) {
        this._entity.transform.position.y = bounds.height / 2;
      }
    }
  };
  var MyScene = class extends lancelot.Scene {
    init() {
      this.remotePlayers = [];
      this.camera.main._entity.addComponent("controller", new CameraControler());
      this.camera.main._entity.transform.scale.set(4, 4);
      const tilemap2 = lancelot.utils.Store.get("tilemap");
      const levelMap = this.createEntity("levelMap");
      levelMap.addComponent("tilemap", new lancelot.graphics.OrthogonalMap(tilemap2));
      levelMap.addComponent("tilemapRenderer", new lancelot.graphics.OrthogonalMapRenderer({
        tilemap: tilemap2,
        tilesets: {
          "bat": AssetsManager.getImage("bat"),
          "environment-tiles": AssetsManager.getImage("tileset")
        },
        camera: this.camera.main
      }));
      levelMap.registerHandler("tilemapObject", (msg) => {
        let o = msg.object;
        switch (o.name) {
          case "player": {
            let player = this.createPlayer(false, msg.layer.zIndex);
            this.player = player;
            player.transform.position.set(o.x, o.y);
            player.addComponent("client", new ChannelClientController2({
              host: SIGNAL_SERVER_HOST,
              refreshRate: REFRESH_RATE,
              rtcConfig: RTC_CONFIG
            }));
            player.registerHandler("connect", () => {
              this.onPlayerConnect();
            });
            player.registerHandler("disconnect", () => {
              this.onPlayerDisconnect();
            });
            player.registerHandler("data", (msg2) => {
              this.onPlayerData(msg2.data);
            });
            player.registerHandler("join", (msg2) => {
              if (msg2.socketId == player.getComponent("controller").socketId) {
                return;
              }
              let entity = this.createPlayer(true);
              entity.getComponent("controller").socketId = msg2.socketId;
            });
            player.registerHandler("leave", (msg2) => {
              const entityToRemove = this.remotePlayers.find((e) => e.getComponent("controller").socketId == msg2.socketId);
              this.removeEntity(entityToRemove);
              this.remotePlayers.splice(this.remotePlayers.indexOf(entityToRemove), 1);
            });
            break;
          }
        }
      });
    }
    onPlayerConnect() {
      const socketId = this.player.getComponent("client")._channelClient.signalServer.socket.id;
      this.player.getComponent("controller").socketId = socketId;
    }
    onPlayerDisconnect() {
      for (let entityToRemove of this.remotePlayers) {
        this.removeEntity(entityToRemove);
      }
      this.remotePlayers.length = 0;
    }
    onPlayerData(data) {
      for (let entityData of data) {
        if (entityData.socketId == this.player.getComponent("controller").socketId) {
          continue;
        }
        let entity = this.remotePlayers.find((e) => e.getComponent("controller").socketId == entityData.socketId);
        if (!entity) {
          entity = this.createPlayer(true);
          entity.getComponent("controller").socketId = entityData.socketId;
        }
        if (entityData.data) {
          const serializer = entity.getComponent("Serializer");
          serializer.deserialize(entityData.data);
          entity.getComponent("controller")._remoteFirstUpdate = true;
        }
      }
    }
    createPlayer(remote) {
      const player = remote ? this.createEntity() : this.createEntity("player");
      player.addComponent("sprite", new lancelot.graphics.AnimatedSpriteDrawable({
        sprite: new lancelot.graphics.Sprite(AssetsManager.getTexture("player")),
        size: new Vector2(TILE_SIZE, TILE_SIZE),
        offset: new Vector2(),
        zIndex: 2,
        camera: this.camera.main
      }));
      player.addComponent("collider", new lancelot.geometry.Collider({
        offset: new Vector2(),
        shape: new lancelot.geometry.shape.Rect(10, 16)
      }));
      player.addComponent("controller", new PlayerController({ remote }));
      player.addComponent("Serializer", new PlayerSerializer());
      if (remote) {
        this.remotePlayers.push(player);
      }
      return player;
    }
  };
  lancelot.Lancelot.init({
    container: document.body,
    width: 960,
    height: 540,
    scene: new MyScene(),
    sceneParams: {},
    viewportMode: "fit",
    async preload() {
      AssetsManager.addImage("bat", await loadImage("assets/bat.png"));
      AssetsManager.addImage("tileset", await loadImage("assets/environment-tiles_extruded.png"));
      AssetsManager.addImage("player", await loadImage("assets/player.png"));
      let tilemap2 = await lancelot.graphics.tilemap.Tilemap.loadFromJson("assets/test1.tmj", { "environment-tiles": "assets/environment-tiles.tsj" });
      lancelot.utils.Store.set("tilemap", tilemap2);
      lancelot.graphics.Animations.create(
        "bat.fly",
        [{ x: 0, y: 0, duration: 0.08 }, { x: 1, y: 0, duration: 0.08 }, { x: 2, y: 0, duration: 0.08 }, { x: 3, y: 0, duration: 0.08 }],
        16,
        16,
        0,
        0
      );
      lancelot.graphics.Animations.create(
        "player.run",
        [{ x: 0, y: 0, duration: 0.16 }, { x: 1, y: 0, duration: 0.16 }, { x: 2, y: 0, duration: 0.16 }, { x: 1, y: 0, duration: 0.16 }],
        16,
        16,
        0,
        0
      );
      lancelot.graphics.Animations.create(
        "player.idle",
        [{ x: 1, y: 1, duration: 0.16 }],
        16,
        16,
        0,
        0
      );
      lancelot.graphics.Animations.create(
        "player.jump",
        [{ x: 0, y: 1, duration: 0.16 }],
        16,
        16,
        0,
        0
      );
      lancelot.graphics.Animations.create(
        "player.climb",
        [{ x: 4, y: 0, duration: 0.16 }, { x: 4, y: 1, duration: 0.16 }],
        16,
        16,
        0,
        0
      );
      AssetsManager.createTexture("bat", AssetsManager.getImage("bat"), {
        anim: lancelot.graphics.Animations.get("bat.fly")
      }, true);
      AssetsManager.createTexture("player", AssetsManager.getImage("player"), {}, false);
    }
  });
})();
