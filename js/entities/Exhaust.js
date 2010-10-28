/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Exhaust');

goog.require('dotprod.Camera');
goog.require('dotprod.entities.Entity');
goog.require('dotprod.Image');
goog.require('dotprod.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 */
dotprod.entities.Exhaust = function(game, position, velocity) {
  dotprod.entities.Entity.call(this);

  this.position_ = position;
  this.velocity_ = velocity;

  /**
   * @type {number}
   * @private
   */
  this.frame_ = 0;

  /**
   * @type {!dotprod.Image}
   * @private
   */
  this.image_ = game.getResourceManager().getImage('exhaust');
};
goog.inherits(dotprod.entities.Exhaust, dotprod.entities.Entity);

/**
 * @return {boolean}
 */
dotprod.entities.Exhaust.prototype.isAlive = function() {
  return this.frame_ < (this.image_.getNumTiles() / 2);
};

dotprod.entities.Exhaust.prototype.update = function() {
  ++this.frame_;
  this.position_ = this.position_.add(this.velocity_);
  this.velocity_ = this.velocity_.scale(0.75);
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.Exhaust.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

  var context = camera.getContext();
  var dimensions = camera.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.image_.getTileWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.image_.getTileHeight() / 2);

  this.image_.render(context, x, y, this.frame_);
};
