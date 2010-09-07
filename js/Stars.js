/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Stars');

/**
 * @constructor
 */
dotprod.Stars = function() {
  /**
   * @type {!Array.<Object>}
   * @private
   */
  this.stars_ = [];
  for (var i = 0; i < dotprod.Stars.STAR_DENSITY_; ++i) {
    var x = Math.round(Math.random() * dotprod.Stars.STAR_TILE_SIZE_);
    var y = Math.round(Math.random() * dotprod.Stars.STAR_TILE_SIZE_);
    this.stars_.push({x: x, y: y});
  }
};

/**
 * @const
 * @type {!number}
 * @private
 */
dotprod.Stars.STAR_DENSITY_ = 32;

/**
 * @const
 * @type {!number}
 * @private
 */
dotprod.Stars.STAR_TILE_SIZE_ = 1024;

/**
 * @const
 * @type {!string}
 * @private
 */
dotprod.Stars.STAR_L1_COLOR_ = 'rgb(184, 184, 184)';

/**
 * @const
 * @type {!string}
 * @private
 */
dotprod.Stars.STAR_L2_COLOR_ = 'rgb(96, 96, 96)';

dotprod.Stars.prototype.render = function(context, x, y, w, h) {
  var leftTile = Math.floor((x - w) / dotprod.Stars.STAR_TILE_SIZE_);
  var rightTile = Math.floor((x + w) / dotprod.Stars.STAR_TILE_SIZE_);
  var topTile = Math.floor((y - h) / dotprod.Stars.STAR_TILE_SIZE_);
  var bottomTile = Math.floor((y + h) / dotprod.Stars.STAR_TILE_SIZE_);

  context.save();
  context.fillStyle = dotprod.Stars.STAR_L1_COLOR_;

  for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
    for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
      for (var i = 0; i < this.stars_.length; ++i) {
        var dx = Math.floor((xTile * dotprod.Stars.STAR_TILE_SIZE_ + this.stars_[i].x - x + w) / 2);
        var dy = Math.floor((yTile * dotprod.Stars.STAR_TILE_SIZE_ + this.stars_[i].y - y + h) / 2);
        context.fillRect(dx, dy, 1, 1);
      }
    }
  }

  leftTile = Math.floor((x - w * 1.5) / dotprod.Stars.STAR_TILE_SIZE_);
  rightTile = Math.floor((x + w * 1.5) / dotprod.Stars.STAR_TILE_SIZE_);
  topTile = Math.floor((y - h * 1.5) / dotprod.Stars.STAR_TILE_SIZE_);
  bottomTile = Math.floor((y + h * 1.5) / dotprod.Stars.STAR_TILE_SIZE_);

  context.fillStyle = dotprod.Stars.STAR_L2_COLOR_;
  for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
    for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
      for (var i = 0; i < this.stars_.length; ++i) {
        var dx = Math.floor((xTile * dotprod.Stars.STAR_TILE_SIZE_ + this.stars_[i].x - x) / 3 + w / 2);
        var dy = Math.floor((yTile * dotprod.Stars.STAR_TILE_SIZE_ + this.stars_[i].y - y) / 3 + h / 2);
        context.fillRect(dx, dy, 1, 1);
      }
    }
  }

  context.restore();
};
