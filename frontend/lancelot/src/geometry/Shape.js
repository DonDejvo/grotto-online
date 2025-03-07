
export const shape = (function() {

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
            return this.x - this.width/2;
        }
        getRight() {
            return this.x + this.width/2;
        }
        getTop() {
            return this.y - this.height/2;
        }
        getBottom() {
            return this.y + this.height/2;
        }
        intersects(shape) {
            if(shape instanceof Rect) {
                return Math.abs(this.x - shape.x) < (this.width + shape.width) / 2 &&
                Math.abs(this.y - shape.y) < (this.height + shape.height) / 2;
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
    }

})();