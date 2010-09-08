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
goog.require('dotprod.layers.Stars');
goog.require('dotprod.Map');
goog.require('dotprod.ResourceManager');

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
   * @type {!dotprod.layers.Stars}
   */
  this.stars_ = new dotprod.layers.Stars();

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
 * @return {boolean}
 */
dotprod.layers.MapLayer.prototype.isCollision = function(x, y) {
  return x < 0 || y < 0 || x >= this.getHeight() || y >= this.getHeight() || this.map_.getTile(Math.floor(x / this.tileset_.getTileWidth()), Math.floor(y / this.tileset_.getTileHeight())) != 0;
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
    context.fillStyle = 'rgb(0, 0, 0)';
    context.fillRect(0, 0, dimensions.width, dimensions.height);

    this.stars_.render(context, dimensions.x, dimensions.y, dimensions.width, dimensions.height);

    var halfWidth = Math.floor(dimensions.width / 2);
    var halfHeight = Math.floor(dimensions.height / 2);

    var leftTile = Math.floor((dimensions.x - halfWidth) / tileWidth);
    var topTile = Math.floor((dimensions.y - halfHeight) / tileHeight);
    var numHorizTiles = Math.ceil(dimensions.width / tileWidth);
    var numVertTiles = Math.ceil(dimensions.height / tileHeight);

    // Don't render tiles before 0th index.
    if (topTile < 0) {
      topTile = 0;
    }

    if (leftTile < 0) {
      leftTile = 0;
    }

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
