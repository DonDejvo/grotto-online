import { assets } from "../utils/AssetsManager.js";

export const tilemap = (function () {

    class Tile {
        constructor(x, y, tileset, animation, properties) {
            this.x = x;
            this.y = y;
            this.tileset = tileset;
            this.animation = animation;
            this.properties = properties;
        }
        get id() {
            return this.tileset.name + "[" + this.x + ";" + this.y + "]";
        }
        getProperty(name) {
            let prop = this.properties.find(e => e.name == name);
            if (prop) {
                return prop.value;
            }
            return null;
        }
    }

    class Tileset {

        static _cache = new Map();

        static async getOrLoadFromJson(filename) {
            if(this._cache.has(filename)) {
                return this._cache.get(filename);
            }
            let data = await assets.loadJson(filename);

            let tileset = new Tileset(data);
            this._cache.set(filename, tileset);
            return tileset;
        }

        constructor(params, image) {
            this._params = params;
            this._image = image;
        }
        get name() {
            return this._params.name;
        }
        get tilecount() {
            return this._params.tilecount;
        }
        get tilewidth() {
            return this._params.tilewidth;
        }
        get tileheight() {
            return this._params.tileheight;
        }
        get margin() {
            return this._params.margin;
        }
        get spacing() {
            return this._params.spacing;
        }
        getTileByIndex(idx) {
            if (idx >= this._params.tilecount || idx < 0) {
                return null;
            }
            const tileData = this._params.tiles.find(e => e.id == idx) || {};
            return new Tile(
                idx % this._params.columns,
                ~~(idx / this._params.columns),
                this,
                tileData.animation || null,
                tileData.properties || []
            );
        }
    }

    class Layer {
        constructor(params) {
            this._tilemap = null;
            this._params = params;
            this._opacity = params.opacity;
        }
        get name() {
            return this._params.name;
        }
        get width() {
            return this._params.width;
        }
        get height() {
            return this._params.height;
        }
        get x() {
            return this._params.x;
        }
        get y() {
            return this._params.y;
        }
        get type() {
            return this._params.type;
        }
        get zIndex() {
            return this._tilemap.getLayers().indexOf(this);
        }
        get opacity() {
            return this._opacity;
        }
        set opacity(value) {
            this._opacity = value;
        }
    }

    class TileLayer extends Layer {
        getTile(x, y) {
            const tileId = this._params.data[(y * this._params.width + x)];
            if (tileId - 1 == -1) {
                return null;
            }
            return this._tilemap.getTileById(tileId);
        }
    }

    class ObjectLayer extends Layer {
        getObjects() {
            return this._params.objects;
        }
    }

    class Tilemap {

        static async loadFromJson(filename, tilesetSources) {
            let data = await assets.loadJson(filename);

            let tilemap = new Tilemap(data.width,
                data.height,
                data.tilewidth,
                data.tileheight);

            for (let layer of data.layers) {
                switch (layer.type) {
                    case "tilelayer":
                        tilemap.addLayer(new TileLayer(layer));
                        break;
                    case "objectgroup":
                        tilemap.addLayer(new ObjectLayer(layer));
                        break;
                }
            }
            for (let tilesetData of data.tilesets) {
                let tileset;
                if(tilesetData.source) {
                    const tokens = tilesetData.source.split(/(\/|\\\/)/);
                    const tilesetName = tokens[tokens.length - 1].split(".tsj")[0];
                    tileset = await Tileset.getOrLoadFromJson(tilesetSources[tilesetName]);
                }
                else {
                    tileset = new Tileset(tilesetData);
                }
                tilemap.addTileset(tileset, tilesetData.firstgid);
            }

            return tilemap;
        }

        constructor(width, height, tilewidth, tileheight) {
            this._width = width;
            this._height = height;
            this._tilewidth = tilewidth;
            this._tileheight = tileheight;
            this._tilesets = [];
            this._layers = [];
        }
        get width() {
            return this._width;
        }
        get height() {
            return this._height;
        }
        get tilewidth() {
            return this._tilewidth;
        }
        get tileheight() {
            return this._tileheight;
        }
        addLayer(layer) {
            layer._tilemap = this;
            this._layers.push(layer);
        }
        addTileset(tileset, firstgid) {
            this._tilesets.push({
                tileset,
                firstgid
            });
        }
        getTilesets() {
            return this._tilesets.map(e => e.tileset);
        }
        getLayers() {
            return this._layers;
        }
        getLayerByName(name) {
            return this._layers.find(e => e.name == name) || null;
        }
        getTileById(id) {
            const tilesets = this._tilesets;
            for (let tileset of tilesets) {
                let tile = tileset.tileset.getTileByIndex(id - tileset.firstgid);

                if (tile) {
                    return tile;
                }
            }
            return null;
        }
    }

    return {
        Tileset,
        Layer,
        TileLayer,
        ObjectLayer,
        Tilemap
    }

})()