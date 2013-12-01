/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Effect');

goog.require('dotprod.math.Vector');
goog.require('dotprod.model.ModelObject');
goog.require('dotprod.graphics.Animation');
goog.require('dotprod.graphics.Drawable');
goog.require('dotprod.graphics.Layer');

/**
 * @constructor
 * @extends {dotprod.model.ModelObject}
 * @implements {dotprod.graphics.Drawable}
 * @param {!dotprod.Game} game
 * @param {!dotprod.graphics.Animation} animation
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {dotprod.graphics.Layer=} opt_layer
 */
dotprod.model.Effect = function(game, animation, position, velocity, opt_layer) {
  goog.base(this, game.getSimulation());

  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!dotprod.graphics.Animation}
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

  var layer = dotprod.graphics.Layer.EFFECTS;
  if (arguments.length >= 5) {
    layer = opt_layer;
  }

  game.getPainter().registerDrawable(layer, this);
};
goog.inherits(dotprod.model.Effect, dotprod.model.ModelObject);

dotprod.model.Effect.prototype.advanceTime = function() {
  this.animation_.update();
  this.position_ = this.position_.add(this.velocity_);
  if (!this.animation_.isRunning()) {
    this.invalidate();
  }
};

/**
 * @override
 */
dotprod.model.Effect.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();

  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(context, x, y);
};

/**
 * @override
 */
dotprod.model.Effect.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(dotprod.graphics.Layer.EFFECTS, this);
};
