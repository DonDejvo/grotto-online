import * as graphics from "./graphics/_index.js";
import * as utils from "./utils/_index.js";
import * as math from "./math/_index.js";
import * as input from "./input/_index.js";
import * as geometry from "./geometry/_index.js";
import { Scene } from "./core/Scene.js";
import { renderer } from "./graphics/Renderer.js";
import { canvas } from "./graphics/Canvas.js";
import { assets } from "./utils/_index.js";
import { KeyListener } from "./input/KeyListener.js";
import { Component } from "./core/Component.js";

export const lancelot = (function() {

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
            this._lastRAF = undefined;
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
            if(this._instance == null) {
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

            //AssetsManager.createShader("default", [], `color = texture(u_texture, texCoord);`);

            await config.preload();

            this.changeScene(config.scene, config.sceneParams);

            _this._RAF();
        }

        static changeScene(scene, params) {
            const _this = this._get();

            if(_this._scene) {
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

            for(let tex of assets.AssetsManager._textures.values()) {
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
            requestAnimationFrame(t => {
                this._RAF();

                t *= 0.001;
                this._dt = t - (this._lastRAF || t);
                this._dt = Math.min(this._dt, 1 / 20);
                this._lastRAF = t;

                this._accTime += this._dt;
                ++this._fpsCounter;
                if(this._accTime >= 1) {
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
        graphics,
        utils,
        math,
        input,
        geometry
    }

})();