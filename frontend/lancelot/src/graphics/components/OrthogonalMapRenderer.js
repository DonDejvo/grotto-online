import { lancelot } from "../../Lancelot.js";
import { Component } from "../../core/Component.js";
import { Vector } from "../../math/Vector.js";
import { Sprite } from "../Sprite.js";
import { texture } from "../Texture.js";

export class OrthogonalMapRenderer extends Component {
    constructor(params) {
        super();
        this._params = params;
        this._textures = {
            tilesets: [],
            animatedTiles: []
        };
        this._batches = [];
    }
    start() {
        const tilemap = this._params.tilemap;
        const tilesets = tilemap.getTilesets();
        for (let i = 0; i < tilesets.length; ++i) {
            const tileset = tilesets[i];
            let tilesetTex = new texture.Texture(this._entity._scene.renderer._gl, this._params.tilesets[tileset.name], {});
            this._textures.tilesets.push({
                name: tileset.name,
                texture: tilesetTex
            });
            for (let i = 0; i < tileset.tilecount; ++i) {
                const tile = tileset.getTileByIndex(i);
                if (tile.animation) {
                    let animtedTileTex = new texture.AnimatedTexture(this._entity._scene.renderer._gl, this._params.tilesets[tileset.name], {
                        anim: {
                            frameWidth: tileset.tilewidth,
                            frameHeight: tileset.tileheight,
                            margin: tileset.margin,
                            spacing: tileset.spacing,
                            frames: tile.animation.map(e => {
                                let frameTile = tileset.getTileByIndex(e.tileid);
                                return { x: frameTile.x, y: frameTile.y, duration: e.duration / 1000 };
                            })
                        }
                    });
                    this._textures.animatedTiles.push({
                        tileId: tile.id,
                        texture: animtedTileTex
                    });
                }
            }
        }

        const layers = tilemap.getLayers();
        for (let i = 0; i < layers.length; ++i) {
            const layer = layers[i];
            let batch;
            switch (layer.type) {
                case "tilelayer": {
                    batch = this._entity._scene.renderer._createBatch(layer.zIndex, true, this._params.camera, true);
                    
                    for (let j = 0; j < layer.height; ++j) {
                        for (let k = 0; k < layer.width; ++k) {
                            const tile = layer.getTile(k, j);
                            if (tile) {
                                let sprite;
                                if (tile.animation) {
                                    sprite = new Sprite(this._textures.animatedTiles.find(e => e.tileId == tile.id).texture);
                                }
                                else {
                                    sprite = new Sprite(this._textures.tilesets.find(e => e.name == tile.tileset.name).texture);
                                    sprite.setRegion(tile.tileset.margin + tile.x * (tilemap.tilewidth + tile.tileset.spacing),
                                        tile.tileset.margin + (tile.y) * (tilemap.tileheight + tile.tileset.spacing),
                                        tilemap.tilewidth,
                                        tilemap.tileheight);
                                }
                                
                                const renderObject = {
                                    sprite,
                                    zIndex: i,
                                    fixed: true,
                                    x: (k + layer.x + 0.5) * tilemap.tilewidth,
                                    y: (j + layer.y + 0.5) * tilemap.tileheight,
                                    sx: tilemap.tilewidth,
                                    sy: tilemap.tileheight,
                                    angle: 0
                                };
                                batch.spriteBatch.add(renderObject);
                            }
                        }
                    }
                    break;
                }
                case "objectgroup": {
                    let objects = layer.getObjects();
                    batch = this._entity._scene.renderer._createBatch(layer.zIndex, true, this._params.camera, true);
                    
                    for (let o of objects) {
                        if (o.gid) {
                            let tile = tilemap.getTileById(o.gid);
                            if(!tile) {
                                continue;
                            }
                            let sprite;
                            if (tile.animation) {
                                sprite = new Sprite(this._textures.animatedTiles.find(e => e.tileId == tile.id).texture);
                            }
                            else {
                                sprite = new Sprite(this._textures.tilesets.find(e => e.name == tile.tileset.name).texture);
                                sprite.setRegion(tile.tileset.margin + tile.x * (tilemap.tilewidth + tile.tileset.spacing),
                                    tile.tileset.margin + (tile.y) * (tilemap.tileheight + tile.tileset.spacing),
                                    tilemap.tilewidth,
                                    tilemap.tileheight);
                            }
                            let angle = lancelot.math.math.degToRad(o.rotation);
                            let offset = new Vector(o.width/2, -o.height/2).rot(angle);
                            const renderObject = {
                                sprite,
                                zIndex: i,
                                fixed: true,
                                x: o.x + offset.x,
                                y: o.y + offset.y,
                                sx: o.width,
                                sy: o.height,
                                angle: angle
                            };
                            batch.spriteBatch.add(renderObject);
                        }
                    }
                    break;
                }
            }

            this._batches.push({ batch, layerName: layer.name });
        }
    }
    update(dt) {
        for (let tex of this._textures.animatedTiles) {
            tex.texture.update(dt);
        }
        let layers = this._params.tilemap.getLayers();
        for(let layer of layers) {
            let batch = this._batches.find(e => e.layerName == layer.name);
            batch.batch.ambientColor[3] = layer.opacity;
        }
    }
    destroy() {
        for (let batch of this._batches) {
            this._entity._scene.renderer._removeBatch(batch.batch);
        }
        for (let tex of this._textures.tilesets) {
            tex.destroy();
        }
        for (let tex of this._textures.animatedTiles) {
            tex.destroy();
        }
    }
}