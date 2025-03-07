export class Sprite {
    constructor(t) {
        this.texture = t;
        this.coords = [
            0, 0,
            1, 0,
            1, 1,
            0, 1
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
}