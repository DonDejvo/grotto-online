export class KeyListener {

    static _instance = null;

    static _get() {
        if(this._instance == null) {
            this._instance = new KeyListener();
        }
        return this._instance;
    }

    constructor() {
        this._prevKeysDown = new Set();
        this._keysDown = new Set();
        this._keysPressed = new Set();
        this._keysReleased = new Set();
    }
    start() {
        addEventListener("keydown", e => this._onKeyDown(e.code));
        addEventListener("keyup", e => this._onKeyUp(e.code));
    }
    static isDown(key) {
        return this._get()._keysDown.has(key);
    }
    static isPressed(key) {
        return this._get()._keysPressed.has(key);
    }
    static isReleased(key) {
        return this._get()._keysReleased.has(key);
    }
    update() {
        this._keysPressed.clear();
        this._keysReleased.clear();

        this._keysDown.forEach(key => {
            if(!this._prevKeysDown.has(key)) {
                this._keysPressed.add(key);
            }
        });

        this._prevKeysDown.forEach(key => {
            if(!this._keysDown.has(key)) {
                this._keysReleased.add(key);
            }
        });

        this._prevKeysDown = new Set(this._keysDown);
    }
    _onKeyDown(keyCode) {
        this._keysDown.add(keyCode);
    }
    _onKeyUp(keyCode) {
        this._keysDown.delete(keyCode);
    }
}