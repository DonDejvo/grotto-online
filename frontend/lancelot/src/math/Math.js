export const math = (function () {
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
            return ~~(Math.random() * (max - min + 1) +min);
        }
    }
})()