import { Component } from "../../core/Component.js";
import { Matrix } from "../../math/Matrix.js";

export const camera = (function() {

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
            const width = this._wcWidth / this._entity.transform.scale.x,
            height = this._getWCHeight() / this._entity.transform.scale.y;
            const p = this._entity.transform.position;
            return { x: p.x - width/2, y: p.y - height/2, width, height };
        }
        
        update() {
            const halfW = this._wcWidth * 0.5 / this._entity.transform.scale.x,
            halfH = this._getWCHeight() * 0.5 / this._entity.transform.scale.y;
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
            const x = this._viewport[0],
            y = gl.canvas.height - this._viewport[3] - this._viewport[1],
            w = this._viewport[2], 
            h = this._viewport[3];
    
            gl.viewport(x, y, w, h);
            //gl.scissor(x, y, w, h);
        }

        _getWCHeight() {
            return this._wcWidth * this._viewport[3] / this._viewport[2];
        }
    }

    return {
        Camera
    }

})();