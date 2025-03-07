export class Vector {
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
        return new Vector(this.x, this.y);
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
        return (this.x * this.x +  this.y * this.y) ** 0.5;
    }
    unit() {
        let d = this.mag();
        if(d == 0) {
            this.x = 0;
            this.y = 0;
        }
        else {
            this.x /= d;
            this.y /= d;
        }
        return this;
    }
    rot(rad) {
        let s = Math.sin(rad),
            c = Math.cos(rad);
        let x = c * this.x - s * this.y;
        let y = s * this.x + c * this.y;
        this.x = x;
        this.y = y;
        return this;
    }
    transformMat(m) {
        let x = this.x,
        y = this.y,
        z = 0,
        w = 1;
    
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
}