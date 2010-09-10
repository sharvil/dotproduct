/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.Bullet');

goog.require('dotprod.Camera');
goog.require('dotprod.layers.MapLayer');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @extends {dotprod.sprites.Sprite}
 * @param {!dotprod.MapLayer} mapLayer
 * @param {number} x
 * @param {number} y
 * @param {number} xVel
 * @param {number} yVel
 */
dotprod.sprites.Bullet = function(mapLayer, x, y, xVel, yVel) {
  dotprod.sprites.Sprite.call(this);

  /**
   * @type {!dotprod.MapLayer}
   * @private
   */
  this.mapLayer_ = mapLayer;

  /**
   * @type {number}
   * @private
   */
  this.lifetime_ = 500;

  this.x_ = x;
  this.y_ = y;

  this.xVelocity_ = xVel;
  this.yVelocity_ = yVel;
};
goog.inherits(dotprod.sprites.Bullet, dotprod.sprites.Sprite);

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.sprites.Bullet.RADIUS_ = 10;

/**
 * @return {boolean}
 */
dotprod.sprites.Bullet.prototype.isAlive = function() {
  return this.lifetime_ >= 0;
};

/**
 * @param {number} timeDiff
 * @override
 */
dotprod.sprites.Bullet.prototype.update = function(timeDiff) {
  this.lifetime_ -= timeDiff;
  if (!this.isAlive()) {
    return;
  }
  this.x_ += this.xVelocity_ * timeDiff;
  var collision = this.mapLayer_.getCollision(this);
  if (collision) {
    this.x_ = this.xVelocity_ >= 0 ? collision.left : collision.right;
    this.xVelocity_ = -this.xVelocity_;
  }
  this.y_ += this.yVelocity_ * timeDiff;
  collision = this.mapLayer_.getCollision(this);
  if (collision) {
    this.y_ = this.yVelocity_ >= 0 ? collision.top : collision.bottom;
    this.yVelocity_ = -this.yVelocity_;
  }
};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.sprites.Bullet.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  var x = this.x_ - dimensions.left;
  var y = this.y_ - dimensions.top;

  if (x + dotprod.sprites.Bullet.RADIUS_ < 0 || y + dotprod.sprites.Bullet.RADIUS_ < 0 || x >= dimensions.width || y >= dimensions.height) {
    return;
  }

  context.save();
    var radgrad2 = context.createRadialGradient(x, y, 0, x, y, dotprod.sprites.Bullet.RADIUS_);
    radgrad2.addColorStop(0, '#fff');
    radgrad2.addColorStop(1, 'rgba(255,1,136,0)');
    context.fillStyle = radgrad2;
    context.fillRect(x - dotprod.sprites.Bullet.RADIUS_, y - dotprod.sprites.Bullet.RADIUS_, dotprod.sprites.Bullet.RADIUS_ * 2, dotprod.sprites.Bullet.RADIUS_ * 2);
  context.restore();
};
