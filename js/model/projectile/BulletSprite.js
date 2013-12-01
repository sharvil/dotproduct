/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('model.projectile.BulletSprite');

goog.require('model.projectile.Bullet');
goog.require('model.Effect');
goog.require('math.Vector');
goog.require('graphics.Drawable');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.projectile.Bullet}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} level
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
model.projectile.BulletSprite = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  goog.base(this, game, owner, level, position, velocity, lifetime, damage, bounceCount);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.bouncingAnimation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(5 + level);
  this.bouncingAnimation_.setRepeatCount(-1);

  game.getPainter().registerDrawable(graphics.Layer.PROJECTILES, this);
};
goog.inherits(model.projectile.BulletSprite, model.projectile.Bullet);

/**
 * @override
 */
model.projectile.BulletSprite.prototype.advanceTime = function() {
  goog.base(this, 'advanceTime');
  this.animation_.update();
  this.bouncingAnimation_.update();
};

/**
 * @override
 */
model.projectile.BulletSprite.prototype.render = function(viewport) {
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);
  var animation = this.bounceCount_ ? this.bouncingAnimation_ : this.animation_;

  animation.render(viewport.getContext(), x, y);
};

/**
 * @override
 */
model.projectile.BulletSprite.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  var animation = this.game_.getResourceManager().getSpriteSheet('explode0').getAnimation(0);
  var explosion = new model.Effect(this.game_, animation, this.position_, new math.Vector(0, 0));
};

/**
 * @override
 */
model.projectile.BulletSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.PROJECTILES, this);
};
