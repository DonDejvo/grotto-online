import { lancelot } from "./lancelot/dist/lancelot-cdn-module.js";
const { AssetsManager, loadImage } = lancelot.utils.assets;
const { Vector } = lancelot.math;
const { ChannelServerController, ChannelClientController } = lancelot.network;

const TILE_SIZE = 16;
const TEST_ROOM = "GrottoTest";
const SIGNAL_SERVER_HOST =  "localhost:8080"; //"https://grotto-online.onrender.com";
const REFRESH_RATE = 1000 / 60;
const RTC_CONFIG = {
    
};

class PlayerSerializer extends lancelot.Component {
    serialize() {
        const controller = this.getComponent("controller");
        const playerData = {};
        playerData.position = this._entity.transform.position;
        playerData.velocity = controller._velocity;
        playerData.grounded = controller._grounded;
        playerData.climbing = controller._climbing;
        playerData.input = controller._input;
        return JSON.stringify(playerData);
    }
}

class Mover extends lancelot.Component {
    constructor() {
        super();
        this._velocity = new Vector();
        this._grounded = false;
        this._climbing = false;
        this._slopes = [];
    }
    updatePhysics(dt) {
        const moveDist = this._velocity.clone().scale(dt);

        this._grounded = false;

        this._entity.transform.position.x += moveDist.x;

        let collider = this.getComponent("collider");
        let tiles;

        // horizontal collision
        collider.setPosition(this._entity.transform.position);
        let rect = collider.shape;

        let lastRect = collider.shape.clone();

        if (!this._slopes.length) {
            tiles = this._getTiles(
                new Vector(rect.getLeft(), rect.getTop()),
                new Vector(rect.getRight(), rect.getBottom())
            );

            tiles = tiles.filter(e => e.tile && (e.tile.getProperty("collide")));
            for (let tile of tiles) {
                this._collide(tile, moveDist.x < 0 ? "l" : "r", lastRect);
            }
        }
        else {
            for (let slope of this._slopes)
                this._updateSlope(slope);
        }


        this._entity.transform.position.y += moveDist.y;

        collider.setPosition(this._entity.transform.position);

        // vertical collision

        tiles = this._getTiles(
            new Vector(rect.getLeft(), rect.getTop()),
            new Vector(rect.getRight(), rect.getBottom())
        );



        tiles = tiles.filter(e => e.tile && (e.tile.getProperty("collide") || (this._isTopLedder(e) && !this._climbing)));
        for (let tile of tiles) {
            this._collide(tile, moveDist.y < 0 ? "u" : "d", lastRect);
        }
    }

    _isTopLedder(tile) {
        const tilemap = this._entity._scene.getEntityByName("levelMap")
            .getComponent("tilemap");
        let topTile = tilemap.tilemap.getLayerByName("midground").getTile(tile.x, tile.y - 1);
        return tile.tile.getProperty("ledder") && (
            !topTile ||
            (topTile.tile &&
                topTile.tile.getProperty("ledder") == false));
    }

    _getTiles(min, max) {
        let tiles = [];

        const tilemap = this._entity._scene.getEntityByName("levelMap")
            .getComponent("tilemap");

        let x1 = ~~(min.x / tilemap.tilemap.tilewidth),
            x2 = ~~(max.x / tilemap.tilemap.tilewidth),
            y1 = ~~(min.y / tilemap.tilemap.tileheight),
            y2 = ~~(max.y / tilemap.tilemap.tileheight);

        let layers = tilemap.tilemap.getLayers();
        let layer = layers.find(e => e.name == "midground");

        for (let x = x1; x <= x2; ++x) {
            for (let y = y1; y <= y2; ++y) {
                tiles.push({ tile: layer.getTile(x, y), x, y });
            }
        }

        return tiles;
    }

    _updateSlope(t) {

        let collider = this.getComponent("collider");
        let rect = collider.shape;

        let y1 = (t.y + 1 - t.tile.getProperty("y1")) * TILE_SIZE,
            y2 = (t.y + 1 - t.tile.getProperty("y2")) * TILE_SIZE,
            x1 = t.x * TILE_SIZE,
            x2 = (t.x + 1) * TILE_SIZE;

        if ((rect.getLeft() > x2 || rect.getRight() < x1) && (
            rect.getBottom() >= Math.max(y1, y2) || rect.getBottom() <= Math.min(y1, y2))
        ) {
            let idx = this._slopes.indexOf(t);
            this._slopes.splice(idx, 1);
            return;
        }

        let x = y1 < y2 ? rect.getLeft() : rect.getRight();

        let y = lancelot.math.math.map(y1, y2, x1, x2, lancelot.math.math.clamp(x, x1, x2));

        this._entity.transform.position.y = y - rect.height / 2;

        if (rect.getBottom() > y) {
            this._grounded = true;
            this._entity.transform.position.y = y - rect.height / 2;
            this._velocity.y = 0;
        }
    }

    _collide(t, direction, lastRect) {
        let collider = this.getComponent("collider");
        let rect = collider.shape;
        let tileRect = new lancelot.geometry.shape.Rect(TILE_SIZE, TILE_SIZE);
        tileRect.setPosition((t.x + 0.5) * TILE_SIZE, (t.y + 0.5) * TILE_SIZE);

        if (!rect.intersects(tileRect)) {
            return;
        }

        if (t.tile.getProperty("slope")) {
            if (direction != "d") {
                return;
            }

            let collider = this.getComponent("collider");
            let rect = collider.shape;

            let y1 = (t.y + 1 - t.tile.getProperty("y1")) * TILE_SIZE,
                y2 = (t.y + 1 - t.tile.getProperty("y2")) * TILE_SIZE,
                x1 = t.x * TILE_SIZE,
                x2 = (t.x + 1) * TILE_SIZE;

            let x = y1 < y2 ? rect.getLeft() : rect.getRight();

            let y = lancelot.math.math.map(y1, y2, x1, x2, lancelot.math.math.clamp(x, x1, x2));

            if (rect.getBottom() > y || this._slopes.length) {
                this._grounded = true;
                this._slopes.push(t);
                if (rect.getBottom() > y) {
                    this._entity.transform.position.y = y - rect.height / 2;
                    this._velocity.y = 0;
                }
            }

        }
        else {
            switch (direction) {
                case "l":
                    if (rect.getLeft() < tileRect.getRight()) {
                        this._entity.transform.position.x = tileRect.getRight() + rect.width / 2;
                        this._velocity.x = 0;
                    }
                    break;
                case "r":
                    if (rect.getRight() > tileRect.getLeft()) {
                        this._entity.transform.position.x = tileRect.getLeft() - rect.width / 2;
                        this._velocity.x = 0;
                    }
                    break;
                case "u":
                    if (!t.tile.getProperty("ledder") && rect.getTop() < tileRect.getBottom()) {
                        this._entity.transform.position.y = tileRect.getBottom() + rect.height / 2;
                        this._velocity.y = 0;
                    }
                    break;
                case "d":
                    if (rect.getBottom() > tileRect.getTop() && (!t.tile.getProperty("ledder") || lastRect.getBottom() <= tileRect.getTop())) {
                        this._grounded = true;
                        this._entity.transform.position.y = tileRect.getTop() - rect.height / 2;
                        this._velocity.y = 0;
                    }
                    break;
            }
        }


        collider.setPosition(this._entity.transform.position);
    }


}

class PlayerController extends Mover {
    constructor(params) {
        super();
        this._maxSpeed = 80;
        this._acceleration = 300;
        this._jumpForce = 95;
        this._climbingSpeed = 40;
        this._gravity = 180;
        this._idleClimbing = false;
        this._moving = false;
        this._input = {
            left: false,
            right: false,
            jump: false,
            up: false,
            down: false
        };
        this._ledders = [];
        this._justClimbed = 0;
        this._remote = params.remote ?? false;
        this._roomCreated = false;
    }
    start() {
        const sprite = this.getComponent("sprite");
        sprite.playAnim(lancelot.graphics.Animations.get("player.idle"), true);
    }
    update(dt) {

        if (!this._remote) {
            this._updateInput();
        }

        this._moving = false;
        if (this._justClimbed > 0) --this._justClimbed;

        if (!(this._input.up || this._input.down) && this._input.jump && (this._grounded || this._climbing)) {
            this._grounded = false;
            this._climbing = false;
            this._slopes = [];
            this._velocity.y = -this._jumpForce * (Math.abs(this._velocity.x / this._maxSpeed) * 0.1 + 1);
        }

        let collider = this.getComponent("collider");
        collider.setPosition(this._entity.transform.position);
        let rect = collider.shape;

        if (this._climbing) {
            this._idleClimbing = true;

            let topLedderRectTop = Infinity;
            this._ledders.forEach(e => {
                let tileRect = new lancelot.geometry.shape.Rect(TILE_SIZE, TILE_SIZE);
                tileRect.setPosition((e.x + 0.5) * TILE_SIZE, (e.y + 0.5) * TILE_SIZE);
                if (topLedderRectTop > tileRect.getTop()) {
                    topLedderRectTop = tileRect.getTop();
                }
                return rect.intersects(tileRect);
            });
            this._ledders = this._getTiles(
                new Vector(rect.getLeft() + rect.width / 2, rect.getTop()),
                new Vector(rect.getRight() - rect.width / 2, rect.getBottom()))
                .filter(e => {
                    let tileRect = new lancelot.geometry.shape.Rect(TILE_SIZE, TILE_SIZE);
                    tileRect.setPosition((e.x + 0.5) * 16, (e.y + 0.5) * TILE_SIZE);
                    return e.tile && e.tile.getProperty("ledder")
                });

            if (((this._input.left || this._input.right) && !(this._input.up || this._input.down)) || !this._ledders.length) {
                this._climbing = false;
                this._velocity.y = 0;
                if (this._input.up && !this._ledders.length) {
                    this._entity.transform.position.y = topLedderRectTop - rect.height / 2;
                    this._justClimbed = 2;
                }
            }
            else {
                if (this._input.up) {
                    this._idleClimbing = false;
                    this._velocity.y = -this._climbingSpeed;
                }
                else if (this._input.down) {
                    this._idleClimbing = false;
                    this._velocity.y = this._climbingSpeed;
                    if (this._grounded) {
                        this._climbing = false;
                    }
                }
                else {
                    this._velocity.y = 0;
                }
            }

        }
        else {
            if (this._input.left) {
                this._moving = true;
                this._velocity.x -= this._acceleration * dt;
            }
            else if (this._input.right) {
                this._moving = true;
                this._velocity.x += this._acceleration * dt;
            }

            if ((this._input.up || this._input.down)) {
                let tiles = this._getTiles(
                    new Vector(rect.getLeft() + rect.width / 2, rect.getTop()),
                    new Vector(rect.getRight() - rect.width / 2, rect.getBottom()));
                this._ledders = tiles.filter(e => {
                    let tileRect = new lancelot.geometry.shape.Rect(TILE_SIZE, TILE_SIZE);
                    tileRect.setPosition((e.x + 0.5) * 16, (e.y + 0.5) * TILE_SIZE);
                    return e.tile && e.tile.getProperty("ledder") &&
                        ((this._input.up && tileRect.getTop() < rect.getBottom()) ||
                            (this._input.down && tileRect.getBottom() > rect.getBottom()))
                });
                if (this._ledders.length) {
                    this._climbing = true;
                    this._velocity.x = 0;
                    this._entity.transform.position.x = (this._ledders[0].x + 0.5) * TILE_SIZE;
                }
            }

            if (!this._moving) {
                this._velocity.x -= this._velocity.x * Math.min((this._grounded ? 10 : 2.5) * dt, 1);
            }

            if (Math.abs(this._velocity.x) > this._maxSpeed) {
                this._velocity.x = Math.sign(this._velocity.x) * this._maxSpeed;
            }

            this._velocity.y += this._gravity * dt;
        }

        this._updateSprite();

        this.updatePhysics(dt);
    }

    _updateSprite() {
        const sprite = this.getComponent("sprite");

        if (this._climbing || this._justClimbed > 0) {
            if (!sprite.isAnimPlaying("player.climb"))
                sprite.playAnim(lancelot.graphics.Animations.get("player.climb"), true);
            if (this._idleClimbing) {
                sprite.pauseAnim();
            }
            else {
                sprite.resumeAnim();
            }
        }
        else {
            if (this._input.left) {
                this._entity.transform.scale.x = -1;
            }
            else if (this._input.right) {
                this._entity.transform.scale.x = 1;
            }

            if (!this._grounded) {
                if (!sprite.isAnimPlaying("player.jump"))
                    sprite.playAnim(lancelot.graphics.Animations.get("player.jump"), true);
            }
            else {
                if (this._moving) {
                    if (!sprite.isAnimPlaying("player.run"))
                        sprite.playAnim(lancelot.graphics.Animations.get("player.run"), true);
                }
                else {
                    if (!sprite.isAnimPlaying("player.idle"))
                        sprite.playAnim(lancelot.graphics.Animations.get("player.idle"), true);
                }
            }
        }
    }

    _updateInput() {
        if (!this._roomCreated && lancelot.input.KeyListener.isPressed("KeyK")) {

            this._createRoom();
        }
        if (lancelot.input.KeyListener.isPressed("KeyJ")) {
            this._joinRoom();
        }
        if (lancelot.input.KeyListener.isPressed("KeyL")) {
            this._leaveRoom();
        }

        this._input.left = lancelot.input.KeyListener.isDown("KeyA");
        this._input.right = lancelot.input.KeyListener.isDown("KeyD");
        this._input.up = lancelot.input.KeyListener.isDown("KeyW");
        this._input.down = lancelot.input.KeyListener.isDown("KeyS");
        this._input.jump = lancelot.input.KeyListener.isPressed("Space");
    }

    _joinRoom() {
        const client = this.getComponent("client");
        client._channelClient.joinRoom(TEST_ROOM);
    }

    _leaveRoom() {
        const client = this.getComponent("client");
        client._channelClient.leaveRoom();
    }

    _createRoom() {
        const serverEntity = this._entity._scene.createEntity("server");
        serverEntity.addComponent("server", new ChannelServerController({
            room: TEST_ROOM,
            host: SIGNAL_SERVER_HOST,
            refreshRate: REFRESH_RATE,
            rtcConfig: RTC_CONFIG
        }));

        this._roomCreated = true;
    }
}

class CameraControler extends lancelot.Component {
    update(dt) {
        const player = this._entity._scene.getEntityByName("player");
        this._entity.transform.position.lerp(player.transform.position, Math.min(dt * 4, 1));

        const tilemap = this._entity._scene.getEntityByName("levelMap")
            .getComponent("tilemap");
        const camera = this._entity.getComponent("camera");
        const bounds = camera.getBoundingRect();
        if (bounds.x + bounds.width > tilemap.tilemap.width * tilemap.tilemap.tilewidth) {
            this._entity.transform.position.x = tilemap.tilemap.width * tilemap.tilemap.tilewidth - bounds.width / 2;
        }
        else if (bounds.x < 0) {
            this._entity.transform.position.x = bounds.width / 2;
        }
        if (bounds.y + bounds.height > tilemap.tilemap.height * tilemap.tilemap.tileheight) {
            this._entity.transform.position.y = tilemap.tilemap.height * tilemap.tilemap.tileheight - bounds.height / 2;
        }
        else if (bounds.y < 0) {
            this._entity.transform.position.y = bounds.height / 2;
        }
    }
}

class MyScene extends lancelot.Scene {
    init() {
        this.remotePlayers = [];

        this.camera.main._entity.addComponent("controller", new CameraControler());
        this.camera.main._entity.transform.scale.set(4, 4);

        const tilemap = lancelot.utils.Store.get("tilemap");
        const levelMap = this.createEntity("levelMap");
        levelMap.addComponent("tilemap", new lancelot.graphics.OrthogonalMap(tilemap));
        levelMap.addComponent("tilemapRenderer", new lancelot.graphics.OrthogonalMapRenderer({
            tilemap,
            tilesets: {
                "bat": AssetsManager.getImage("bat"),
                "environment-tiles": AssetsManager.getImage("tileset")
            },
            camera: this.camera.main
        }));
        levelMap.registerHandler("tilemapObject", msg => {
            let o = msg.object;
            switch (o.name) {
                case "player": {
                    let player = this.createPlayer(false, msg.layer.zIndex);
                    this.player = player;
                    player.transform.position.set(o.x, o.y);
                    player.addComponent("Serializer", new PlayerSerializer());
                    player.addComponent("client", new ChannelClientController({
                        host: SIGNAL_SERVER_HOST,
                        refreshRate: REFRESH_RATE,
                        rtcConfig: RTC_CONFIG
                    }));
                    player.registerHandler("connect", () => {
                        this.onPlayerConnect();
                    });
                    player.registerHandler("disconnect", () => {
                        this.onPlayerDisconnect();
                    });
                    player.registerHandler("data", (msg) => {
                        this.onPlayerData(msg.data);
                    });
                    player.registerHandler("join", (msg) => {
                        if (msg.socketId == player.getComponent("controller").socketId) {
                            return;
                        }
                        let entity = this.createPlayer(true);
                        entity.getComponent("controller").socketId = msg.socketId;

                    });
                    player.registerHandler("leave", (msg) => {
                        const entityToRemove = this.remotePlayers.find(e => e.getComponent("controller").socketId == msg.socketId);
                        this.removeEntity(entityToRemove);
                        this.remotePlayers.splice(this.remotePlayers.indexOf(entityToRemove), 1);
                    });
                    break;
                }
            }
        });
    }

    onPlayerConnect() {
        const socketId = this.player.getComponent("client")._channelClient.signalServer.socket.id;
        this.player.getComponent("controller").socketId = socketId;
    }

    onPlayerDisconnect() {
        for (let entityToRemove of this.remotePlayers) {
            this.removeEntity(entityToRemove);
        }
        this.remotePlayers.length = 0;
    }

    onPlayerData(data) {
        for (let entityData of data) {
            if (entityData.socketId == this.player.getComponent("controller").socketId) {
                continue;
            }

            let entity = this.remotePlayers.find(e => e.getComponent("controller").socketId == entityData.socketId);
            if (!entity) {
                entity = this.createPlayer(true);
                entity.getComponent("controller").socketId = entityData.socketId;
            }
            if (entityData.data) {
                const controller = entity.getComponent("controller");
                entity.transform.position.copy(entityData.data.position);
                controller._input = entityData.data.input;
                controller._velocity.copy(entityData.data.velocity);
                controller._grounded = entityData.data.grounded;
                controller._climbing = entityData.data.climbing;
            }
        }
    }

    createPlayer(remote) {
        const player = remote ? this.createEntity() : this.createEntity("player");
        player.addComponent("sprite", new lancelot.graphics.AnimatedSpriteDrawable({
            sprite: new lancelot.graphics.Sprite(AssetsManager.getTexture("player")),
            size: new Vector(TILE_SIZE, TILE_SIZE),
            offset: new Vector(),
            zIndex: 2,
            camera: this.camera.main
        }));
        player.addComponent("collider", new lancelot.geometry.Collider({
            offset: new Vector(),
            shape: new lancelot.geometry.shape.Rect(10, 16)
        }));
        player.addComponent("controller", new PlayerController({ remote }));
        if (remote) {
            this.remotePlayers.push(player);
        }
        return player;
    }
}

lancelot.Lancelot.init({
    container: document.body,
    width: 960,
    height: 540,
    scene: new MyScene(),
    sceneParams: {},
    viewportMode: "fit",
    async preload() {

        AssetsManager.addImage("bat", await loadImage("assets/bat.png"));
        AssetsManager.addImage("tileset", await loadImage("assets/environment-tiles_extruded.png"));
        AssetsManager.addImage("player", await loadImage("assets/player.png"));

        let tilemap = await lancelot.graphics.tilemap.Tilemap.loadFromJson("assets/test1.tmj", { "environment-tiles": "assets/environment-tiles.tsj" });
        lancelot.utils.Store.set("tilemap", tilemap);

        lancelot.graphics.Animations.create("bat.fly",
            [{ x: 0, y: 0, duration: 0.08 }, { x: 1, y: 0, duration: 0.08 }, { x: 2, y: 0, duration: 0.08 }, { x: 3, y: 0, duration: 0.08 }],
            16, 16,
            0, 0
        );

        lancelot.graphics.Animations.create("player.run",
            [{ x: 0, y: 0, duration: 0.16 }, { x: 1, y: 0, duration: 0.16 }, { x: 2, y: 0, duration: 0.16 }, { x: 1, y: 0, duration: 0.16 }],
            16, 16,
            0, 0
        );
        lancelot.graphics.Animations.create("player.idle",
            [{ x: 1, y: 1, duration: 0.16 }],
            16, 16,
            0, 0
        );
        lancelot.graphics.Animations.create("player.jump",
            [{ x: 0, y: 1, duration: 0.16 }],
            16, 16,
            0, 0
        );
        lancelot.graphics.Animations.create("player.climb",
            [{ x: 4, y: 0, duration: 0.16 }, { x: 4, y: 1, duration: 0.16 }],
            16, 16,
            0, 0
        );

        AssetsManager.createTexture("bat", AssetsManager.getImage("bat"), {
            anim: lancelot.graphics.Animations.get("bat.fly")
        }, true);
        AssetsManager.createTexture("player", AssetsManager.getImage("player"), {}, false);
    }
});