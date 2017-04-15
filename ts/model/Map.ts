import Rect from 'math/Rect';
import Vector from 'math/Vector';
import Entity from 'model/Entity';
import Image from 'graphics/Image';
import Quadtree from 'structs/Quadtree';
import { TileType, ObjectType } from 'types';
import Game from 'ui/Game';

export default class Map {
  private static readonly COLLISION_EPSILON_ = 0.0001;
  private static readonly MAX_SPAWN_LOCATION_ATTEMPTS_ = 10;

  private mapData_ : any;
  private tileProperties_ : Array<any>;
  private width_ : number;
  private height_ : number;
  private spawnRadius_ : number;
  private tileWidth_ : number;
  private tileHeight_ : number;
  private quadtree_ : Quadtree;

  constructor(game : Game, mapData : any, tileProperties : Array<any>) {
    let settings = game.getSettings();
    let tileset = game.getResourceManager().getImage('tileset');

    this.mapData_ = mapData;
    this.tileProperties_ = tileProperties;
    this.width_ = settings['map']['width'];
    this.height_ = settings['map']['height'];
    this.spawnRadius_ = settings['map']['spawnRadius'];
    this.tileWidth_ = tileset.getTileWidth();
    this.tileHeight_ = tileset.getTileHeight();
    this.quadtree_ = new Quadtree(mapData, this.width_, this.height_);
  }

  public getWidth() : number {
    return this.width_;
  }

  public getHeight() : number {
    return this.height_;
  }

  public getTileWidth() : number {
    return this.tileWidth_;
  }

  public getTileHeight() : number {
    return this.tileHeight_;
  }

  public toTileCoordinates(vector : Vector) : Vector {
    let xTile = Math.floor(vector.x / this.tileWidth_);
    let yTile = Math.floor(vector.y / this.tileHeight_);

    assert(xTile >= 0 && xTile < this.width_, 'Invalid x coordinate.');
    assert(yTile >= 0 && yTile < this.height_, 'Invalid y coordinate.');

    return new Vector(xTile, yTile);
  }

  public getTile(x : number, y : number) : number {
    let index = x + y * this.width_;
    return this.mapData_[index] ? this.mapData_[index] : TileType.NONE;
  }

  public setTile(x : number, y : number, value : number) {
    assert(x >= 0 && x < this.width_, 'Invalid x coordinate.');
    assert(y >= 0 && y < this.height_, 'Invalid y coordinate.');

    let index = x + y * this.width_;
    if (value == TileType.NONE) {
      delete this.mapData_[index];
    } else {
      this.mapData_[index] = value;
    }
  }

  public getTileProperties(tileValue : number) : any {
    assert(tileValue >= 0 && tileValue < this.tileProperties_.length, 'Tile value out of bounds: ' + tileValue);
    return this.tileProperties_[tileValue];
  }

  public getTiles(rect : Rect) : Array<any> {
    return this.quadtree_.tilesForViewport(rect);
  }

  public getSpawnLocation(entity : Entity) : Vector {
    let cX = this.width_ * this.tileWidth_ / 2;
    let cY = this.height_ * this.tileHeight_ / 2;
    let dimensions = entity.getDimensions();

    let x;
    let y;
    let attempts = 0;

    do {
      let deltaX = Math.random() * this.spawnRadius_ * 2 - this.spawnRadius_;
      let deltaY = Math.random() * this.spawnRadius_ * 2 - this.spawnRadius_;

      x = Math.floor(cX + deltaX);
      y = Math.floor(cY + deltaY);

      dimensions.left = x - dimensions.radius;
      dimensions.right = x + dimensions.radius;
      dimensions.top = y - dimensions.radius;
      dimensions.bottom = y + dimensions.radius;

    } while (this.getCollision_(dimensions) && attempts++ < Map.MAX_SPAWN_LOCATION_ATTEMPTS_);

    return new Vector(x, y);
  }

  public getCollision(entity : Entity) : any | null {
    return this.getCollision_(entity.getDimensions());
  }

  private getCollision_(dimensions : any) : any {
    let left = dimensions.left;
    let right = dimensions.right;
    let top = dimensions.top;
    let bottom = dimensions.bottom;
    let radius = dimensions.radius;

    let totalWidth = this.width_ * this.tileWidth_;
    let totalHeight = this.height_ * this.tileHeight_;

    // Trivial case 1: left/top of map.
    if (left < 0 || top < 0) {
      return {
        left: -Map.COLLISION_EPSILON_ - radius,
        right: this.tileWidth_ + radius,
        top: -Map.COLLISION_EPSILON_ - radius,
        bottom: this.tileHeight_ + radius,
        xTile: 0,
        yTile: 0,
        tileValue: TileType.COLLISION,
        object: ObjectType.NONE
      };
    }

    // Trivial case 2: right/bottom of map.
    if (right >= totalWidth || bottom >= totalHeight) {
      return {
        left: totalWidth - this.tileWidth_ - Map.COLLISION_EPSILON_ - radius,
        right: totalWidth + radius,
        top: totalHeight - this.tileHeight_ - Map.COLLISION_EPSILON_ - radius,
        bottom: totalHeight + radius,
        xTile: this.width_,
        yTile: this.height_,
        tileValue: TileType.COLLISION,
        object: ObjectType.NONE
      };
    }

    let leftTile = Math.floor(left / this.tileWidth_);
    let rightTile = Math.floor(right / this.tileWidth_);
    let topTile = Math.floor(top / this.tileHeight_);
    let bottomTile = Math.floor(bottom / this.tileHeight_);
    let ret : any = null;

    for (let yTile = topTile; yTile <= bottomTile; ++yTile) {
      for (let xTile = leftTile; xTile <= rightTile; ++xTile) {
        let tileValue = this.getTile(xTile, yTile);
        if (tileValue == TileType.NONE) {
          continue;
        }

        let tileProperties = this.getTileProperties(tileValue);
        if (tileProperties['collision']) {
          ret = {
            left: xTile * this.tileWidth_ - Map.COLLISION_EPSILON_ - radius,
            right: (xTile + 1) * this.tileWidth_ + radius,
            top: yTile * this.tileHeight_ - Map.COLLISION_EPSILON_ - radius,
            bottom: (yTile + 1) * this.tileHeight_ + radius,
            xTile: xTile,
            yTile: yTile,
            tileValue: tileValue,
            object: tileProperties['object']
          };

          // If the collision was due to a prize, we keep checking for a more concrete
          // collision. Otherwise, we know we've collided with a solid object and should
          // cause a bounce / explosion.
          if (!tileProperties['object']) {
            break;
          }
        }
      }
    }

    return ret;
  }
}
