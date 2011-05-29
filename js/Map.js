/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Map');

goog.require('dotprod.entities.Entity');
goog.require('dotprod.Image');
goog.require('dotprod.Quadtree');
goog.require('dotprod.Rect');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @param {!dotprod.Game} game
 * @param {!Object.<number, number>} mapData
 */
dotprod.Map = function(game, mapData) {
  var settings = game.getSettings();
  var tileset = game.getResourceManager().getImage('tileset');

  /**
   * @type {!Object.<number, number>}
   * @private
   */
   this.mapData_ = mapData;

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
   * @type {!dotprod.Quadtree}
   * @private
   */
  this.quadtree_ = new dotprod.Quadtree(mapData, this.width_, this.height_);
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.Map.COLLISION_EPSILON_ = 0.0001;

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.Map.MAX_SPAWN_LOCATION_ATTEMPTS_ = 10;

/**
 * @return {number}
 */
dotprod.Map.prototype.getWidth = function() {
  return this.width_;
};

/**
 * @return {number}
 */
dotprod.Map.prototype.getHeight = function() {
  return this.height_;
};

/**
 * @param {number} x X-coordinate in tile units.
 * @param {number} y Y-coordinate in tile units.
 * @return {number}
 */
dotprod.Map.prototype.getTile = function(x, y) {
  var index = x + y * this.width_;
  return this.mapData_[index] ? this.mapData_[index] : 0;
};

/**
 * @param {!dotprod.Rect} rect
 * @return {!Array.<!Object>}
 */
dotprod.Map.prototype.getTiles = function(rect) {
  return this.quadtree_.tilesForViewport(rect);
};

/**
 * @param {!dotprod.entities.Entity} entity
 * @return {!dotprod.Vector}
 */
dotprod.Map.prototype.getSpawnLocation = function(entity) {
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

  } while (this.getCollision_(dimensions) && attempts++ < dotprod.Map.MAX_SPAWN_LOCATION_ATTEMPTS_);

  return new dotprod.Vector(x, y);
};

/**
 * @param {!dotprod.entities.Entity} entity
 * @return {Object}
 */
dotprod.Map.prototype.getCollision = function(entity) {
  return this.getCollision_(entity.getDimensions());
};

/**
 * @param {!Object} dimensions
 * @return {Object}
 */
dotprod.Map.prototype.getCollision_ = function(dimensions) {
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
      left: -dotprod.Map.COLLISION_EPSILON_ - xRadius,
      right: this.tileWidth_ + xRadius,
      top: -dotprod.Map.COLLISION_EPSILON_ - yRadius,
      bottom: this.tileHeight_ + yRadius
    };
  }

  // Trivial case 2: right/bottom of map.
  if (right >= totalWidth || bottom >= totalHeight) {
    return {
      left: totalWidth - this.tileWidth_ - dotprod.Map.COLLISION_EPSILON_ - xRadius,
      right: totalWidth + xRadius,
      top: totalHeight - this.tileHeight_ - dotprod.Map.COLLISION_EPSILON_ - yRadius,
      bottom: totalHeight + yRadius
    };
  }

  var leftTile = Math.floor(left / this.tileWidth_);
  var rightTile = Math.floor(right / this.tileWidth_);
  var topTile = Math.floor(top / this.tileHeight_);
  var bottomTile = Math.floor(bottom / this.tileHeight_);

  for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
    for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
      if (this.getTile(xTile, yTile) != 0) {
        return {
          left: xTile * this.tileWidth_ - dotprod.Map.COLLISION_EPSILON_ - xRadius,
          right: (xTile + 1) * this.tileWidth_ + xRadius,
          top: yTile * this.tileHeight_ - dotprod.Map.COLLISION_EPSILON_ - yRadius,
          bottom: (yTile + 1) * this.tileHeight_ + yRadius
        };
      }
    }
  }

  return null;
};
