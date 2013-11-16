/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Map');

goog.require('goog.asserts');

goog.require('dotprod.math.Rect');
goog.require('dotprod.math.Vector');
goog.require('dotprod.model.Entity');
goog.require('dotprod.graphics.Image');
goog.require('dotprod.ObjectType');
goog.require('dotprod.structs.Quadtree');
goog.require('dotprod.TileType');

/**
 * @constructor
 * @param {!dotprod.Game} game
 * @param {!Object.<number, number>} mapData
 * @param {!Array.<!Object>} tileProperties
 */
dotprod.model.Map = function(game, mapData, tileProperties) {
  var settings = game.getSettings();
  var tileset = game.getResourceManager().getImage('tileset');

  /**
   * @type {!Object.<number, number>}
   * @private
   */
   this.mapData_ = mapData;

   /**
    * @type {!Array.<!Object>}
    * @private
    */
   this.tileProperties_ = tileProperties;

  /**
   * @type {number}
   * @private
   */
  this.width_ = settings['map']['width'];

  /**
   * @type {number}
   * @private
   */
  this.height_ = settings['map']['height'];

  /**
   * @type {number}
   * @private
   */
  this.spawnRadius_ = settings['map']['spawnRadius'];

  /**
   * @type {number}
   * @private
   */
  this.tileWidth_ = tileset.getTileWidth();

  /**
   * @type {number}
   * @private
   */
  this.tileHeight_ = tileset.getTileHeight();

  /**
   * @type {!dotprod.structs.Quadtree}
   * @private
   */
  this.quadtree_ = new dotprod.structs.Quadtree(mapData, this.width_, this.height_);
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.model.Map.COLLISION_EPSILON_ = 0.0001;

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.model.Map.MAX_SPAWN_LOCATION_ATTEMPTS_ = 10;

/**
 * @return {number}
 */
dotprod.model.Map.prototype.getWidth = function() {
  return this.width_;
};

/**
 * @return {number}
 */
dotprod.model.Map.prototype.getHeight = function() {
  return this.height_;
};

/**
 * @return {number}
 */
dotprod.model.Map.prototype.getTileWidth = function() {
  return this.tileWidth_;
};

/**
 * @return {number}
 */
dotprod.model.Map.prototype.getTileHeight = function() {
  return this.tileHeight_;
};

/**
 * @param {!dotprod.math.Vector} vector A vector in pixel coordinates.
 * @return {!dotprod.math.Vector} A vector in map tile coordinates.
 */
dotprod.model.Map.prototype.toTileCoordinates = function(vector) {
  var xTile = Math.floor(vector.getX() / this.tileWidth_);
  var yTile = Math.floor(vector.getY() / this.tileHeight_);

  goog.asserts.assert(xTile >= 0 && xTile < this.width_, 'Invalid x coordinate.');
  goog.asserts.assert(yTile >= 0 && yTile < this.height_, 'Invalid y coordinate.');

  return new dotprod.math.Vector(xTile, yTile);
};

/**
 * @param {number} x X-coordinate in tile units.
 * @param {number} y Y-coordinate in tile units.
 * @return {number}
 */
dotprod.model.Map.prototype.getTile = function(x, y) {
  var index = x + y * this.width_;
  return this.mapData_[index] ? this.mapData_[index] : dotprod.TileType.NONE;
};

/**
 * @param {number} x X-coordinate in tile units.
 * @param {number} y Y-coordinate in tile units.
 * @param {number} value New tile value.
 */
dotprod.model.Map.prototype.setTile = function(x, y, value) {
  goog.asserts.assert(x >= 0 && x < this.width_, 'Invalid x coordinate.');
  goog.asserts.assert(y >= 0 && y < this.height_, 'Invalid y coordinate.');

  var index = x + y * this.width_;
  if (value == dotprod.TileType.NONE) {
    delete this.mapData_[index];
  } else {
    this.mapData_[index] = value;
  }
};

/**
 * @return {!Object}
 */
dotprod.model.Map.prototype.getTileProperties = function(tileValue) {
  goog.asserts.assert(tileValue >= 0 && tileValue < this.tileProperties_.length, 'Tile value out of bounds: ' + tileValue);
  return this.tileProperties_[tileValue];
};

/**
 * @param {!dotprod.math.Rect} rect
 * @return {!Array.<!Object>}
 */
dotprod.model.Map.prototype.getTiles = function(rect) {
  return this.quadtree_.tilesForViewport(rect);
};

/**
 * @param {!dotprod.model.Entity} entity
 * @return {!dotprod.math.Vector}
 */
dotprod.model.Map.prototype.getSpawnLocation = function(entity) {
  var cX = this.width_ * this.tileWidth_ / 2;
  var cY = this.height_ * this.tileHeight_ / 2;
  var dimensions = entity.getDimensions();

  var x;
  var y;
  var attempts = 0;

  do {
    var deltaX = Math.random() * this.spawnRadius_ * 2 - this.spawnRadius_;
    var deltaY = Math.random() * this.spawnRadius_ * 2 - this.spawnRadius_;

    x = Math.floor(cX + deltaX);
    y = Math.floor(cY + deltaY);

    dimensions.left = x - dimensions.xRadius;
    dimensions.right = x + dimensions.xRadius;
    dimensions.top = y - dimensions.yRadius;
    dimensions.bottom = y + dimensions.yRadius;

  } while (this.getCollision_(dimensions) && attempts++ < dotprod.model.Map.MAX_SPAWN_LOCATION_ATTEMPTS_);

  return new dotprod.math.Vector(x, y);
};

/**
 * @param {!dotprod.model.Entity} entity
 * @return {Object}
 */
dotprod.model.Map.prototype.getCollision = function(entity) {
  return this.getCollision_(entity.getDimensions());
};

/**
 * @param {!Object} dimensions
 * @return {Object}
 */
dotprod.model.Map.prototype.getCollision_ = function(dimensions) {
  var left = dimensions.left;
  var right = dimensions.right;
  var top = dimensions.top;
  var bottom = dimensions.bottom;
  var xRadius = dimensions.xRadius;
  var yRadius = dimensions.yRadius;

  var totalWidth = this.width_ * this.tileWidth_;
  var totalHeight = this.height_ * this.tileHeight_;

  // Trivial case 1: left/top of map.
  if (left < 0 || top < 0) {
    return {
      left: -dotprod.model.Map.COLLISION_EPSILON_ - xRadius,
      right: this.tileWidth_ + xRadius,
      top: -dotprod.model.Map.COLLISION_EPSILON_ - yRadius,
      bottom: this.tileHeight_ + yRadius,
      xTile: 0,
      yTile: 0,
      tileValue: dotprod.TileType.COLLISION,
      object: dotprod.ObjectType.NONE
    };
  }

  // Trivial case 2: right/bottom of map.
  if (right >= totalWidth || bottom >= totalHeight) {
    return {
      left: totalWidth - this.tileWidth_ - dotprod.model.Map.COLLISION_EPSILON_ - xRadius,
      right: totalWidth + xRadius,
      top: totalHeight - this.tileHeight_ - dotprod.model.Map.COLLISION_EPSILON_ - yRadius,
      bottom: totalHeight + yRadius,
      xTile: this.width_,
      yTile: this.height_,
      tileValue: dotprod.TileType.COLLISION,
      object: dotprod.ObjectType.NONE
    };
  }

  var leftTile = Math.floor(left / this.tileWidth_);
  var rightTile = Math.floor(right / this.tileWidth_);
  var topTile = Math.floor(top / this.tileHeight_);
  var bottomTile = Math.floor(bottom / this.tileHeight_);
  var ret = null;

  for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
    for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
      var tileValue = this.getTile(xTile, yTile);
      if (tileValue == dotprod.TileType.NONE) {
        continue;
      }

      var tileProperties = this.getTileProperties(tileValue);
      if (tileProperties['collision']) {
        ret = {
          left: xTile * this.tileWidth_ - dotprod.model.Map.COLLISION_EPSILON_ - xRadius,
          right: (xTile + 1) * this.tileWidth_ + xRadius,
          top: yTile * this.tileHeight_ - dotprod.model.Map.COLLISION_EPSILON_ - yRadius,
          bottom: (yTile + 1) * this.tileHeight_ + yRadius,
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
};
