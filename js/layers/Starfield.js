/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.Starfield');

goog.require('dotprod.graphics.Drawable');
goog.require('dotprod.graphics.Painter.Layer');
goog.require('dotprod.Viewport');

/**
 * @constructor
 * @implements {dotprod.graphics.Drawable}
 * @param {!dotprod.Game} game
 */
dotprod.layers.Starfield = function(game) {
  /**
   * Pattern for L1 stars (stars closer in distance).
   *
   * @type {!Array.<Object>}
   * @private
   */
  this.stars_ = [];

  /**
   * Pattern for L2 stars (stars further away in distance).
   *
   * @type {!Array.<Object>}
   * @private
   */
  this.stars2_ = [];

  for (var i = 0; i < dotprod.layers.Starfield.STAR_DENSITY_; ++i) {
    var x1 = Math.round(Math.random() * dotprod.layers.Starfield.STAR_TILE_SIZE_);
    var y1 = Math.round(Math.random() * dotprod.layers.Starfield.STAR_TILE_SIZE_);
    this.stars_.push({x: x1, y: y1});

    var x2 = Math.round(Math.random() * dotprod.layers.Starfield.STAR_TILE_SIZE_);
    var y2 = Math.round(Math.random() * dotprod.layers.Starfield.STAR_TILE_SIZE_);
    this.stars2_.push({x: x2, y: y2});
  }

  game.getPainter().registerDrawable(dotprod.graphics.Painter.Layer.STARFIELD, this);
};

/**
 * @const
 * @type {!number}
 * @private
 */
dotprod.layers.Starfield.STAR_DENSITY_ = 32;

/**
 * @const
 * @type {!number}
 * @private
 */
dotprod.layers.Starfield.STAR_TILE_SIZE_ = 1024;

/**
 * @const
 * @type {!string}
 * @private
 */
dotprod.layers.Starfield.STAR_L1_COLOR_ = 'rgb(184, 184, 184)';

/**
 * @const
 * @type {!string}
 * @private
 */
dotprod.layers.Starfield.STAR_L2_COLOR_ = 'rgb(96, 96, 96)';

/**
 * @override
 */
dotprod.layers.Starfield.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();
  var x = dimensions.x;
  var y = dimensions.y;
  var w = dimensions.width;
  var h = dimensions.height;

  var leftTile = Math.floor((x - w) / dotprod.layers.Starfield.STAR_TILE_SIZE_);
  var rightTile = Math.floor((x + w) / dotprod.layers.Starfield.STAR_TILE_SIZE_);
  var topTile = Math.floor((y - h) / dotprod.layers.Starfield.STAR_TILE_SIZE_);
  var bottomTile = Math.floor((y + h) / dotprod.layers.Starfield.STAR_TILE_SIZE_);

  context.save();

    context.fillStyle = dotprod.layers.Starfield.STAR_L1_COLOR_;

    for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
      for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
        for (var i = 0; i < this.stars_.length; ++i) {
          var dx = Math.floor((xTile * dotprod.layers.Starfield.STAR_TILE_SIZE_ + this.stars_[i].x - x + w) / 2);
          var dy = Math.floor((yTile * dotprod.layers.Starfield.STAR_TILE_SIZE_ + this.stars_[i].y - y + h) / 2);
          context.fillRect(dx, dy, 1, 1);
        }
      }
    }

    leftTile = Math.floor((x - w * 1.5) / dotprod.layers.Starfield.STAR_TILE_SIZE_);
    rightTile = Math.floor((x + w * 1.5) / dotprod.layers.Starfield.STAR_TILE_SIZE_);
    topTile = Math.floor((y - h * 1.5) / dotprod.layers.Starfield.STAR_TILE_SIZE_);
    bottomTile = Math.floor((y + h * 1.5) / dotprod.layers.Starfield.STAR_TILE_SIZE_);

    context.fillStyle = dotprod.layers.Starfield.STAR_L2_COLOR_;
    for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
      for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
        for (var i = 0; i < this.stars2_.length; ++i) {
          var dx = Math.floor((xTile * dotprod.layers.Starfield.STAR_TILE_SIZE_ + this.stars2_[i].x - x) / 3 + w / 2);
          var dy = Math.floor((yTile * dotprod.layers.Starfield.STAR_TILE_SIZE_ + this.stars2_[i].y - y) / 3 + h / 2);
          context.fillRect(dx, dy, 1, 1);
        }
      }
    }

  context.restore();
};
