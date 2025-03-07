import { Entity } from "./Entity.js";
import { EntityManager } from "./EntityManager.js";
import { camera } from "../graphics/components/Camera.js";

export class Scene {
    constructor() {
        this._started = false;
        this._entityManager = new EntityManager();
        this._pendingEntities = [];
        this._camera = {};
    }

    get camera() {
        return this._camera;
    }

    get renderer() {
        return this._renderer;
    }

    init() {}

    createEntity(name) {
        const e = new Entity(name);
        if(this._started) {
            this._pendingEntities.push(e);
        }
        else {
            this._entityManager.add(e);
            e._scene = this;
        }
        return e;
    }

    removeEntity(e) {
        this._entityManager.remove(e);
        if(this._started) {
            e.destroy();
        }
    }

    getEntitiesByGroup(g) {
        return this._entityManager._entities.filter(e => e.groups.has(g));
    }

    getEntityByName(n) {
        return this._entityManager.get(n);
    }

    createCamera(name, params) {
        const cam = this._camera[name] = new camera.Camera(params);
        const e = this.createEntity();
        e.addComponent("camera", cam);
        e.groups.add("camera");
        return cam;
    }

    start() {
        this._renderer.start();
        for(let i = 0; i < this._entityManager._entities.length; ++i) {
            this._entityManager._entities[i].start();
        }
        this._started = true;
    }

    update(dt) {
        for(let i = 0; i < this._entityManager._entities.length; ++i) {
            this._entityManager._entities[i].update(dt);
        }
        while(this._pendingEntities.length > 0) {
            const e = this._pendingEntities.pop();
            this._entityManager.add(e);
            e._scene = this;
            e.start();
        }
    }

    render() {
        for(let attr in this._camera) {
            this._camera[attr].update();
        }
        this._renderer.render();
    }

    destroy() {
        for(let i = 0; i < this._entityManager._entities.length; ++i) {
            this._entityManager._entities[i].destroy();
        }
        this._started = false;
    }
}