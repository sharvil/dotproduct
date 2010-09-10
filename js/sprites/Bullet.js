/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.Bullet');

goog.require('dotprod.Camera');
goog.require('dotprod.layers.MapLayer');
goog.require('dotprod.sprites.Sprite');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.sprites.Sprite}
 * @param {!dotprod.layers.MapLayer} mapLayer
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 */
dotprod.sprites.Bullet = function(mapLayer, position, velocity) {
  dotprod.sprites.Sprite.call(this);

  /**
   * @type {!dotprod.layers.MapLayer}
   * @private
   */
  this.mapLayer_ = mapLayer;

  /**
   * @type {number}
   * @private
   */
  this.lifetime_ = 500;

  this.position_ = position;
  this.velocity_ = velocity;
};
goog.inherits(dotprod.sprites.Bullet, dotprod.sprites.Sprite);

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.sprites.Bullet.RADIUS_ = 5;

/**
 * @return {boolean}
 */
dotprod.sprites.Bullet.prototype.isAlive = function() {
  return this.lifetime_ >= 0;
};

/**
 * @param {number} timeDiff
 */
dotprod.sprites.Bullet.prototype.update = function(timeDiff) {
  this.lifetime_ -= timeDiff;
  if (!this.isAlive()) {
    return;
  }

  this.position_ = this.position_.add(this.velocity_.getXComponent().scale(timeDiff));
  var collision = this.mapLayer_.getCollision(this);
  if (collision) {
    var xVel = this.velocity_.getX();
    this.position_ = new dotprod.Vector(xVel >= 0 ? collision.left : collision.right, this.position_.getY());
    this.velocity_ = new dotprod.Vector(-xVel, this.velocity_.getY());
  }

  this.position_ = this.position_.add(this.velocity_.getYComponent().scale(timeDiff));
  collision = this.mapLayer_.getCollision(this);
  if (collision) {
    var yVel = this.velocity_.getY();
    this.position_ = new dotprod.Vector(this.position_.getX(), yVel >= 0 ? collision.top : collision.bottom);
    this.velocity_ = new dotprod.Vector(this.velocity_.getX(), -yVel);
  }
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.sprites.Bullet.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  var x = this.position_.getX() - dimensions.left;
  var y = this.position_.getY() - dimensions.top;

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
