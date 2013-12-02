goog.provide('model.projectile.BurstSprite');

goog.require('math.Vector');
goog.require('model.projectile.Burst');
goog.require('model.Effect');
goog.require('graphics.Drawable');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.projectile.Burst}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 */
model.projectile.BurstSprite = function(game, owner, position, velocity, lifetime, damage) {
  goog.base(this, game, owner, position, velocity, lifetime, damage);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.activeAnimation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(9);
  this.activeAnimation_.setRepeatCount(-1);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.inactiveAnimation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(4);
  this.inactiveAnimation_.setRepeatCount(-1);

  game.getPainter().registerDrawable(graphics.Layer.PROJECTILES, this);
};
goog.inherits(model.projectile.BurstSprite, model.projectile.Burst);

/**
 * @override
 */
model.projectile.BurstSprite.prototype.advanceTime = function() {
  goog.base(this, 'advanceTime');
  this.activeAnimation_.update();
  this.inactiveAnimation_.update();
};

/**
 * @override
 */
model.projectile.BurstSprite.prototype.render = function(viewport) {
  var animation = this.isActive_ ? this.activeAnimation_ : this.inactiveAnimation_;
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - animation.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - animation.getHeight() / 2);

  animation.render(viewport.getContext(), x, y);
};

/**
 * @override
 */
model.projectile.BurstSprite.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getSpriteSheet('explode0').getAnimation(0);
  var explosion = new model.Effect(this.game_, animation, this.position_, math.Vector.ZERO);
};

/**
 * @override
 */
model.projectile.BurstSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.PROJECTILES, this);
};
