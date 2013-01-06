/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Effect');

goog.require('dotprod.Animation');
goog.require('dotprod.math.Vector');
goog.require('dotprod.model.ModelObject');

/**
 * @constructor
 * @implements {dotprod.model.ModelObject}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Animation} animation
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 */
dotprod.entities.Effect = function(game, animation, position, velocity) {
  /**
   * @type {boolean}
   * @private
   */
  this.isValid_ = true;

  /**
   * @type {!dotprod.Animation}
   * @private
   */
  this.animation_ = animation;

  /**
   * @type {!dotprod.math.Vector}
   * @private
   */
  this.position_ = position;

  /**
   * @type {!dotprod.math.Vector}
   * @private
   */
  this.velocity_ = velocity;

  game.getSimulation().registerObject(this);
  game.getEffectIndex().addEffect(this);
};

/**
 * @override
 */
dotprod.entities.Effect.prototype.isValid = function() {
  return this.isValid_;
};

dotprod.entities.Effect.prototype.invalidate = function() {
  this.isValid_ = false;
};

dotprod.entities.Effect.prototype.advanceTime = function() {
  this.animation_.update();
  this.position_ = this.position_.add(this.velocity_);
  if (!this.animation_.isRunning()) {
    this.invalidate();
  }
};

dotprod.entities.Effect.prototype.render = function(camera) {
  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(context, x, y);
};
