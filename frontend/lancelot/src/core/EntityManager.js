export class EntityManager {
    constructor() {
        this._entities = [];
        this._entityMap = new Map();
    }

    add(e) {
        this._entities.push(e);
        this._entityMap.set(e.name, e);
    }

    get(n) {
        return this._entityMap.get(n);
    }

    remove(e) {
        const idx = this._entities.indexOf(e);
        this._entities.splice(idx, 1);
        this._entityMap.delete(e.name);
    }
}