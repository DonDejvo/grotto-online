import { lancelot } from "../Lancelot.js";
import { Vector } from "../math/Vector.js";
import { canvas } from "./Canvas.js";

export const textRenderer = (function() {

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
            canvas.resizeCanvas(this._textCanvasCtx.canvas, this._gl.canvas.width, this._gl.canvas.height, lancelot.Lancelot._get()._config.viewportMode)
        }

        destroy() {
            
        }

        add(text, x, y, camera, params = {}) {
            this._texts.push({ 
                text, 
                x, y, 
                color: params.color || "black", 
                fontSize: params.fontSize || "12px", 
                align: params.align || "left",
                fontFamily: params.fontFamily || "system-ui" ,
                camera,
                alive: true
            });
        }

        draw() {
            this._textCanvasCtx.beginPath();
            this._textCanvasCtx.clearRect(0, 0, this._textCanvasCtx.canvas.width, this._textCanvasCtx.canvas.height);

            this._texts = this._texts.filter(e => e.alive);

            for(let text of this._texts) {
                text.alive = false;
                let clipspace = new Vector(text.x, text.y).transformMat(text.camera.projectionView);
                let pixelX = text.camera.viewport[0] + (clipspace.x *  0.5 + 0.5) * text.camera.viewport[2];
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
    }

})();