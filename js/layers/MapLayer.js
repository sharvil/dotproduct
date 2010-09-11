/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.MapLayer');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('dotprod.Camera');
goog.require('dotprod.GameConfig');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.Map');
goog.require('dotprod.ResourceManager');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.Game} game
 */
dotprod.layers.MapLayer = function(game) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!dotprod.TiledImage}
   * @private
   */
   this.tileset_ = this.game_.getResourceManager().getTiledImage('tileset');

  /**
   * @type {!dotprod.Map}
   * @private
   */
  this.map_ = game.getConfig().getMap();
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.layers.MapLayer.COLLISION_EPSILON_ = 0.0001;

/**
 * @return {number}
 */
dotprod.layers.MapLayer.prototype.getWidth = function() {
  return this.map_.getWidth() * this.tileset_.getTileWidth();
};

/**
 * @return {number}
 */
dotprod.layers.MapLayer.prototype.getHeight = function() {
  return this.map_.getHeight() * this.tileset_.getTileHeight();
};

/**
 * @param {!dotprod.sprites.Sprite} sprite
 * @return {Object}
 */
dotprod.layers.MapLayer.prototype.getCollision = function(sprite) {
  var dimensions = sprite.getDimensions();

  var left = dimensions.left;
  var right = dimensions.right;
  var top = dimensions.top;
  var bottom = dimensions.bottom;
  var xRadius = dimensions.xRadius;
  var yRadius = dimensions.yRadius;

  var tileWidth = this.tileset_.getTileWidth();
  var tileHeight = this.tileset_.getTileHeight();

  // Trivial case 1: left/top of map.
  if (left < 0 || right < 0) {
    return {
      left: -dotprod.layers.MapLayer.COLLISION_EPSILON_ - xRadius,
      right: tileWidth + xRadius,
      top: -dotprod.layers.MapLayer.COLLISION_EPSILON_ - yRadius,
      bottom: tileHeight + yRadius
    };
  }

  // Trivial case 2: right/bottom of map.
  if (right >= this.getWidth() || bottom >= this.getHeight()) {
    return {
      left: this.getWidth() - tileWidth - dotprod.layers.MapLayer.COLLISION_EPSILON_ - xRadius,
      right: this.getWidth() + xRadius,
      top: this.getHeight() - tileHeight - dotprod.layers.MapLayer.COLLISION_EPSILON_ - yRadius,
      bottom: this.getHeight() + yRadius
    };
  }

  var leftTile = Math.floor(left / tileWidth);
  var rightTile = Math.floor(right / tileWidth);
  var topTile = Math.floor(top / tileHeight);
  var bottomTile = Math.floor(bottom / tileHeight);

  for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
    for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
      if (this.map_.getTile(xTile, yTile) != 0) {
        return {
          left: xTile * tileWidth - dotprod.layers.MapLayer.COLLISION_EPSILON_ - xRadius,
          right: (xTile + 1) * tileWidth + xRadius,
          top: yTile * tileHeight - dotprod.layers.MapLayer.COLLISION_EPSILON_ - yRadius,
          bottom: (yTile + 1) * tileHeight + yRadius
        };
      }
    }
  }

  return null;
};

/**
 * @param {number} timeDiff
 * @override
 */
dotprod.layers.MapLayer.prototype.update = function(timeDiff) {
};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.MapLayer.prototype.render = function(camera) {
  var dimensions = camera.getDimensions();
  var context = camera.getContext();

  var tileWidth = this.tileset_.getTileWidth();
  var tileHeight = this.tileset_.getTileHeight();

  context.save();
    var halfWidth = Math.floor(dimensions.width / 2);
    var halfHeight = Math.floor(dimensions.height / 2);

    var leftTile = Math.floor((dimensions.x - halfWidth) / tileWidth);
    var topTile = Math.floor((dimensions.y - halfHeight) / tileHeight);
    var numHorizTiles = Math.ceil(dimensions.width / tileWidth);
    var numVertTiles = Math.ceil(dimensions.height / tileHeight);

    // Don't render tiles before 0th index.
    topTile = Math.max(topTile, 0);
    leftTile = Math.max(leftTile, 0);

    // Don't draw tiles past the map width/height.
    if (topTile + numVertTiles >= this.map_.getHeight()) {
      numVertTiles = this.map_.getHeight() - topTile - 1;
    }

    if (leftTile + numHorizTiles >= this.map_.getWidth()) {
      numHorizTiles = this.map_.getWidth() - leftTile - 1;
    }

    for (var y = topTile; y <= topTile + numVertTiles; ++y) {
      for (var x = leftTile; x <= leftTile + numHorizTiles; ++x) {
        var tileNum = this.map_.getTile(x, y);
        if (tileNum == 0 || tileNum > this.tileset_.getNumTiles()) {
          continue;
        }
        this.tileset_.render(context,
                            x * tileWidth - dimensions.x + halfWidth,
                            y * tileHeight - dimensions.y + halfHeight,
                            tileNum - 1);
      }
    }

  context.restore();
};
