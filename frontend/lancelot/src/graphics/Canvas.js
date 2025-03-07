export const canvas = (function() {

    const resizeCanvas = (canvas, width, height, viewportMode) => {
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
                    }
                    else {
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
                    }
                    else {
                        const temp = h * aspect;
                        vw = width;
                        vh = height;
                    }
                    break;
                }
            }
    
            canvas.width = vw;
            canvas.height = vh;
            canvas.style.width = w + "px";
            canvas.style.height = h + "px";
            canvas.style.marginTop = (innerHeight - h) / 2 + "px";
            canvas.style.marginLeft = (innerWidth - w) / 2 + "px";
    }

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
    }

})();