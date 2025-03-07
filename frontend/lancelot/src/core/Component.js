export class Component {
    static _ids = 0;
    constructor() {
        this._id = Component._ids++;
        this._entity = null;
    }
    get id() {
        return this._id;
    }
    getComponent(name) {
        return this._entity.getComponent(name);
    }
    broadcast(msg) {
        this._entity.broadcast(msg);
    }
    start() {}
    update(dt) {}
    destroy() {}
}