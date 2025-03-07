import { renderer } from "../graphics/Renderer.js";
import { texture } from "../graphics/Texture.js";
import { lancelot } from "../Lancelot.js";

export const assets = (function() {

    const loadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                resolve(img);
            }
            img.onerror = () => {
                reject();
            }
        });
    }

    const loadJson = async (src) => {
        const response = await fetch(src);
        const data = await response.json();
        return data;
    }

    class AssetsManager {
    
        static _images = new Map();
        static _jsons = new Map();
        static _textures = new Map();
        static _shaders = new Map();
    
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
            if(animated) {
                tex = new texture.AnimatedTexture(gl, data, params);
            }
            else {
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
        loadImage,
        loadJson,
        AssetsManager
    }

})();