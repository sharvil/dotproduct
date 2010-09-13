/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Player');

goog.require('dotprod.entities.Entity');
goog.require('dotprod.TiledImage');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 */
dotprod.entities.Player = function(name) {
  dotprod.entities.Entity.call(this);

  /**
   * @type {string}
   * @protected
   */
  this.name_ = name;

  /**
   * @type {number}
   * @protected
   */
  this.angleInRadians_ = 0;

  /**
   * @type {!dotprod.TiledImage}
   * @protected
   */
  this.image_;
};
goog.inherits(dotprod.entities.Player, dotprod.entities.Entity);

/**
 * @return {string}
 */
dotprod.entities.Player.prototype.getName = function() {
  return this.name_;
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.Player.prototype.render = function(camera) {
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles());
  var dimensions = camera.getDimensions();
  var context = camera.getContext();

  var x = Math.floor(this.position_.getX() - dimensions.left - this.image_.getTileWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.image_.getTileHeight() / 2);

  this.image_.render(context, x, y, tileNum);

  context.save();
    context.font = '12pt Verdana';
    context.fillStyle = 'rgb(200, 200, 200)';
    context.textAlign = 'center';
    context.fillText(this.name_, x + this.image_.getTileWidth() / 2, y + 3 / 2 * this.image_.getTileHeight());
  context.restore();
};

/**
 * @param {number} timeDiff
 * @param {number} bounceFactor
 * @protected
 */
dotprod.entities.Player.prototype.updatePosition_ = function(timeDiff, bounceFactor) {
  this.position_ = this.position_.add(this.velocity_.getXComponent().scale(timeDiff));
  var collisionRect = this.map_.getCollision(this);
  if (collisionRect) {
    var xVel = this.velocity_.getX();
    this.position_ = new dotprod.Vector(xVel >= 0 ? collisionRect.left : collisionRect.right, this.position_.getY());
    this.velocity_ = new dotprod.Vector(-xVel * bounceFactor, this.velocity_.getY());
  }

  this.position_ = this.position_.add(this.velocity_.getYComponent().scale(timeDiff));
  collisionRect = this.map_.getCollision(this);
  if (collisionRect) {
    var yVel = this.velocity_.getY();
    this.position_ = new dotprod.Vector(this.position_.getX(), yVel >= 0 ? collisionRect.top : collisionRect.bottom);
    this.velocity_ = new dotprod.Vector(this.velocity_.getX(), -yVel * bounceFactor);
  }
};
