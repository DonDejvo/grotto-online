import { Drawable } from "./Drawable.js";

export class SpriteDrawable extends Drawable {
    constructor(params) {
        super(params);
        this._sprite = params.sprite;
    }
    get zIndex() {
        return this._zIndex;
    }
    set zIndex(value) {
        this._zIndex = value;
        this._renderObject.zIndex = value;
        this._entity._scene.renderer.remove(this._renderObject);
        this._entity._scene.renderer.add(this._renderObject);
    }
    get sprite() {
        return this._sprite;
    }
    start() {
        const worldPos = this._entity.transform.getWorldPosition();
        this._renderObject = {
            sprite: this._sprite,
            x: worldPos.x + this._offset.x,
            y: worldPos.y + this._offset.y,
            sx: this._entity.transform.scale.x * this._size.x,
            sy: this._entity.transform.scale.y * this._size.y,
            zIndex: this._zIndex,
            fixed: this._fixed,
            camera: this._camera,
            angle: this._angle
        };
        this._entity._scene.renderer.add(this._renderObject);
    }
    destroy() {
        this._scene.renderer.remove(this._renderObject);
    }
    update() {
        if (!this._fixed) {
            this._updateRenderObject();
        }
    }
    _updateRenderObject() {
        const worldPos = this._entity.transform.getWorldPosition();
        this._renderObject.x = worldPos.x + this._offset.x;
        this._renderObject.y = worldPos.y + this._offset.y;
        this._renderObject.sx = this._entity.transform.scale.x * this._size.x;
        this._renderObject.sy = this._entity.transform.scale.y * this._size.y;
        this._renderObject.angle = this._angle;
    }
}