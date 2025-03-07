import { Component } from "../../core/Component.js";
import { Vector } from "../../math/Vector.js";

export class Collider extends Component {
    constructor(params) {
        super();
        this._position = new Vector();
        this._offset = params.offset;
        this._shape = params.shape;
    }
    get shape() {
        return this._shape;
    }
    getPosition() {
        return this._position.clone();
    }
    setPosition(p) {
        this._position.copy(p);
        this._shape.setPosition(
            p.x + this._offset.x,
            p.y + this._offset.y
        );
    }
}