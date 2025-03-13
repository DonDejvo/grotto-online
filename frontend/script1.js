import { lancelot } from "./lancelot/dist/lancelot-cdn-module.js";
const { KeyListener } = lancelot.input;
const { ChannelServerController, ChannelClientController } = lancelot.network;
const { AssetsManager, loadImage } = lancelot.utils.assets;
const { Vector } = lancelot.math;

class Serializer extends lancelot.Component {
    serialize() {
        const controller = this.getComponent("controller");
        return JSON.stringify({
            name: controller.username,
            position: this._entity.transform.position,
            input: controller._input
        });
    }
}

class PlayerController extends lancelot.Component {
    constructor(remote) {
        super();

        this.username = "NoName";
        this.remote = remote;

        this._input = {
            left: false,
            right: false,
            up: false,
            down: false
        };
    }

    start() {
        const sprite = this.getComponent("sprite");
        sprite.playAnim(lancelot.graphics.Animations.get("player.idle"), true);
    }

    update(dt) {
        if(!this.remote) {
            this._updateInput();
        }

        const vec = new Vector(0, 0);
        if(this._input.left) {
            vec.x = -1;
        } else if(this._input.right) {
            vec.x = 1;
        }

        if(this._input.up) {
            vec.y = -1;
        } else if(this._input.down) {
            vec.y = 1;
        }
        vec.unit().scale(100 * dt);

        this._entity.transform.position.add(vec);
    }

    _joinRoom() {
        const client = this.getComponent("client");
        client._channelClient.joinRoom("Test");
    }

    _leaveRoom() {
        const client = this.getComponent("client");
        client._channelClient.leaveRoom();
    }

    _updateInput() {
        if(KeyListener.isPressed("KeyJ")) {
            this._joinRoom();
        } else if(KeyListener.isPressed("KeyL")) {
            this._leaveRoom();
        }

        this._input.left = lancelot.input.KeyListener.isDown("KeyA");
        this._input.right = lancelot.input.KeyListener.isDown("KeyD");
        this._input.up = lancelot.input.KeyListener.isDown("KeyW");
        this._input.down = lancelot.input.KeyListener.isDown("KeyS");
    }
}

class Manager extends lancelot.Component {
    _roomCreated;

    constructor() {
        super();

        this._roomCreated = false;
    }
    
    update() {
        if(!this._roomCreated && KeyListener.isPressed("KeyC")) {
            console.log("Creating channel server");
            
            this._createRoom();
        }
    }

    _createRoom() {
        const serverEntity = this._entity._scene.createEntity("server");
        serverEntity.addComponent("server", new ChannelServerController({
            room: "Test",
            host: "localhost:8080"
        }));

        this._roomCreated = true;
    }
}

class MyScene extends lancelot.Scene {
    init() {
        this.players = [];

        const manager = this.createEntity("manager");
        manager.addComponent("manager", new Manager());
    
        const player = this.createEntity("player");
        player.addComponent("sprite", new lancelot.graphics.AnimatedSpriteDrawable({
            sprite: new lancelot.graphics.Sprite(AssetsManager.getTexture("player")),
            size: new Vector(32, 32),
            offset: new Vector(0, 0),
            zIndex: 0,
            camera: this.camera.main
        }));
        player.addComponent("controller", new PlayerController(false));
        player.addComponent("client", new ChannelClientController({
            host: "localhost:8080"
        }));
        player.addComponent("Serializer", new Serializer());
        player.registerHandler("connect", (msg) => {
            const socketId = player.getComponent("client")._channelClient.signalServer.socket.id;
            player.getComponent("controller").socketId = socketId;
        });
        player.registerHandler("disconnect", (msg) => {
            for(let entityToRemove of this.players) {
                this.removeEntity(entityToRemove);
            }
            this.players.length = 0;
        });
        player.registerHandler("data", (msg) => {
            for(let entityData of msg.data) {
                if(entityData.socketId == player.getComponent("controller").socketId) {
                    continue;
                }
                
                let entity = this.players.find(e => e.getComponent("controller").socketId == entityData.socketId);
                if(!entity) {
                    entity = this.createRemotePlayer(entityData.socketId);
                }
                if(entityData.data) {
                    entity.transform.position.copy(entityData.data.position);
                    entity.getComponent("controller")._input = entityData.data.input;
                }
            }
            
        });
        player.registerHandler("join", (msg) => {
            if(msg.socketId == player.getComponent("controller").socketId) {
                return;
            }
            this.createRemotePlayer(msg.socketId);
            
        });
        player.registerHandler("leave", (msg) => {
            const entityToRemove = this.players.find(e => e.getComponent("controller").socketId == msg.socketId);
            this.removeEntity(entityToRemove);
            this.players.splice(this.players.indexOf(entityToRemove), 1);
        });
    }

    createRemotePlayer(socketId) {
        const player = this.createEntity();
        player.addComponent("sprite", new lancelot.graphics.AnimatedSpriteDrawable({
            sprite: new lancelot.graphics.Sprite(AssetsManager.getTexture("player")),
            size: new Vector(32, 32),
            offset: new Vector(0, 0),
            zIndex: 0,
            camera: this.camera.main
        }));
        const controller = new PlayerController(true);
        controller.socketId = socketId;
        player.addComponent("controller", controller);
        
        this.players.push(player);
        return player;
    }
}

lancelot.Lancelot.init({
    container: document.body,
    width: 960,
    height: 640,
    viewportMode: "fit",
    scene: new MyScene(),
    sceneParams: {},
    async preload() {
        AssetsManager.addImage("player", await loadImage("assets/player.png"));

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

        AssetsManager.createTexture("player", AssetsManager.getImage("player"), {}, false);
    }
})