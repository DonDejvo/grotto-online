import { Component } from "../../core/Component.js";

export class OrthogonalMap extends Component {
    constructor(tilemap) {
        super();
        this._tilemap = tilemap;
    }
    get tilemap() {
        return this._tilemap;
    }
    start() {
        for(let layer of this._tilemap.getLayers()) {
            if(layer.type != "objectgroup") {
                continue;
            }
            let objects = layer.getObjects();
            for(let o of objects) {
                this.broadcast({
                    topic: "tilemapObject",
                    object: o,
                    layer
                })
            }
        }
    }
}