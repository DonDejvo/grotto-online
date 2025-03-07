export class Animations {
    static _anims = new Map();
    static create(name, frames, frameWidth, frameHeight, margin, spacing) {
        this._anims.set(name, {
            name,
            frames,
            frameWidth, frameHeight,
            margin, spacing
        });
    }
    static get(name) {
        return this._anims.get(name);
    }
}