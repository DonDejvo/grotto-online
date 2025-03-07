import { Component } from "../../core/Component.js";

export class Drawable extends Component {
    constructor(params) {
        super();
        this._offset = params.offset;
        this._size = params.size;
        this._zIndex = params.zIndex;
        this._fixed = params.fixed;
        this._camera = params.camera;
        this._angle = params.angle ?? 0;
    }
    get zIndex() {
        return this._zIndex;
    }
    set zIndex(value) {
        this._zIndex = value;
    }
    get fixed() {
        return this._fixed;
    }
    get offset() {
        return this._offset;
    }
    get size() {
        return this._size;
    }
    get camera() {
        return this._camera;
    }
    get angle() {
        return this._angle;
    }
    set angle(value) {
        this._angle = value;
    }
}