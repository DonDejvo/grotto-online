import { Vector } from "../math/Vector.js";

export class Transform {
    constructor() {
        this._parent = null;
        this._children = new Set();
        this._position = new Vector();
        this._scale = new Vector(1, 1);
    }
    get position() {
        return this._position;
    }
    set position(p) {
        this._position.copy(p);
    }
    get scale() {
        return this._scale;
    }
    set scale(s) {
        this._scale.copy(s);
    }
    getWorldPosition() {
        if(this._parent) {
            return this._parent.getWorldPosition().add(this._position);
        }
        else {
            return this._position.clone();
        }
    }
    setParent(parent) {
        if(this._parent) {
            this._position.add(this._parent.getWorldPosition());
        }

        if(parent) {
            this._position.sub(parent.getWorldPosition());
        }

        this._parent = parent;
    }
}