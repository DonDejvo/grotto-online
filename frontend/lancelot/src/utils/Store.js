export class Store {
    
    static _store = {};

    static get(name) {
        return this._store[name];
    }

    static set(name, data) {
        this._store[name] = data;
    }
}