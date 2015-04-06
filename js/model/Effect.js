goog.provide('model.Effect');

goog.require('math.Vector');
goog.require('model.ModelObject');
goog.require('graphics.Animation');
goog.require('graphics.Drawable');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!graphics.Animation} animation
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {graphics.Layer=} opt_layer
 */
model.Effect = function(game, animation, position, velocity, opt_layer) {
  goog.base(this, game.getSimulation());

  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.animation_ = animation;

  /**
   * @type {!math.Vector}
   * @private
   */
  this.position_ = position;

  /**
   * @type {!math.Vector}
   * @private
   */
  this.velocity_ = velocity;

  var layer = graphics.Layer.EFFECTS;
  if (opt_layer !== undefined) {
    layer = opt_layer;
  }

  game.getPainter().registerDrawable(layer, this);
};
goog.inherits(model.Effect, model.ModelObject);

model.Effect.prototype.advanceTime = function() {
  this.animation_.update();
  this.position_ = this.position_.add(this.velocity_);
  if (!this.animation_.isRunning()) {
    this.invalidate();
  }
};

/**
 * @override
 */
model.Effect.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();

  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(context, x, y);
};

/**
 * @override
 */
model.Effect.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.EFFECTS, this);
};
