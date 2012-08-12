/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Exhaust');

goog.require('dotprod.entities.Entity');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 */
dotprod.entities.Exhaust = function(game, position, velocity) {
  dotprod.entities.Entity.call(this, game);

  this.position_ = position;
  this.velocity_ = velocity;

  /**
   * @type {!dotprod.Animation}
   * @private
   */
  this.image_ = game.getResourceManager().getVideoEnsemble('exhaust').getAnimation(0);

  /**
   * This variable is a tick counter. When it reaches 2, it's reset to 0
   * and the rest of the update routine is performed. It's used to both
   * slow down the animation and synchronize the exhaust animation frame
   * with distance traveled.
   *
   * @type {number}
   * @private
   */
  this.hack_ = 0;
};
goog.inherits(dotprod.entities.Exhaust, dotprod.entities.Entity);

/**
 * @override
 */
dotprod.entities.Exhaust.prototype.isAlive = function() {
  return this.image_.isRunning();
};

dotprod.entities.Exhaust.prototype.update = function() {
  if (++this.hack_ % 2) {
    return;
  }
  this.image_.update();
  this.position_ = this.position_.add(this.velocity_);
  this.velocity_ = this.velocity_.scale(0.75);
  this.hack_ = 0;
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
  var x = Math.floor(this.position_.getX() - dimensions.left - this.image_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.image_.getHeight() / 2);

  this.image_.render(context, x, y);
};
