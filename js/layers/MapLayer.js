/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.MapLayer');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('dotprod.Viewport');
goog.require('dotprod.Image');
goog.require('dotprod.layers.Layer');
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
   * @type {!dotprod.Animation}
   * @private
   */
  this.prizeAnimation_ = this.game_.getResourceManager().getVideoEnsemble('prize').getAnimation(0);
  this.prizeAnimation_.setRepeatCount(-1);

  /**
   * @type {!dotprod.Image}
   * @private
   */
  this.tileset_ = this.game_.getResourceManager().getImage('tileset');
};

/**
 * @override
 */
dotprod.layers.MapLayer.prototype.update = function() {
  this.prizeAnimation_.update();
};

/**
 * @param {!dotprod.Viewport} viewport
 * @override
 */
dotprod.layers.MapLayer.prototype.render = function(viewport) {
  var map = this.game_.getMap();
  var dimensions = viewport.getDimensions();
  var context = viewport.getContext();

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
    if (topTile + numVertTiles >= map.getHeight()) {
      numVertTiles = map.getHeight() - topTile - 1;
    }

    if (leftTile + numHorizTiles >= map.getWidth()) {
      numHorizTiles = map.getWidth() - leftTile - 1;
    }

    for (var y = topTile; y <= topTile + numVertTiles; ++y) {
      for (var x = leftTile; x <= leftTile + numHorizTiles; ++x) {
        var tileNum = map.getTile(x, y);
        if (tileNum == 0) {
          continue;
        } else if (tileNum == 255) {
          this.prizeAnimation_.render(context,
                                      x * tileWidth - dimensions.x + halfWidth,
                                      y * tileHeight - dimensions.y + halfHeight);
        } else if (tileNum <= this.tileset_.getNumTiles()){
          this.tileset_.render(context,
                              x * tileWidth - dimensions.x + halfWidth,
                              y * tileHeight - dimensions.y + halfHeight,
                              tileNum - 1);
        }
      }
    }

  context.restore();
};
