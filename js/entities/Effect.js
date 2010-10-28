/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Effect');

goog.require('dotprod.Animation');
goog.require('dotprod.Vector');

/**
 * @constructor
 */
dotprod.entities.Effect = function(animation, position, velocity) {
  /**
   * @type {!dotprod.Animation}
   * @private
   */
  this.animation_ = animation;

  /**
   * @type {!dotprod.Vector}
   * @private
   */
  this.position_ = position;

  /**
   * @type {!dotprod.Vector}
   * @private
   */
  this.velocity_ = velocity;
};

dotprod.entities.Effect.prototype.isAlive = function() {
  return this.animation_.isRunning();
};

dotprod.entities.Effect.prototype.update = function() {
  this.animation_.update();
  this.position_ = this.position_.add(this.velocity_);
};

dotprod.entities.Effect.prototype.render = function(camera) {
  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(context, x, y);
};
