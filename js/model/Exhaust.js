goog.provide('model.Exhaust');

goog.require('model.Entity');

/**
 * @constructor
 * @extends {model.Entity}
 * @param {!Game} game
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 */
model.Exhaust = function(game, position, velocity) {
  goog.base(this, game);

  this.position_ = position;
  this.velocity_ = velocity;

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.image_ = game.getResourceManager().getSpriteSheet('exhaust').getAnimation(0);

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
goog.inherits(model.Exhaust, model.Entity);

model.Exhaust.prototype.advanceTime = function() {
  if (++this.hack_ % 2) {
    return;
  }
  this.image_.update();
  this.position_ = this.position_.add(this.velocity_);
  this.velocity_ = this.velocity_.scale(0.75);
  this.hack_ = 0;

  if (!this.image_.isRunning()) {
    this.invalidate();
  }
};

/**
 * @param {!Viewport} viewport
 */
model.Exhaust.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.image_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.image_.getHeight() / 2);

  this.image_.render(context, x, y);
};
