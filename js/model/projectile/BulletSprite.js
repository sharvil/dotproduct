/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.projectile.BulletSprite');

goog.require('dotprod.model.projectile.Bullet');
goog.require('dotprod.model.Effect');
goog.require('dotprod.math.Vector');
goog.require('dotprod.graphics.Drawable');
goog.require('dotprod.graphics.Painter.Layer');

/**
 * @constructor
 * @extends {dotprod.model.projectile.Bullet}
 * @implements {dotprod.graphics.Drawable}
 * @param {!dotprod.Game} game
 * @param {!dotprod.model.player.Player} owner
 * @param {number} level
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
dotprod.model.projectile.BulletSprite = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  goog.base(this, game, owner, level, position, velocity, lifetime, damage, bounceCount);

  /**
   * @type {!dotprod.graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getVideoEnsemble('bullets').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {!dotprod.graphics.Animation}
   * @private
   */
  this.bouncingAnimation_ = game.getResourceManager().getVideoEnsemble('bullets').getAnimation(5 + level);
  this.bouncingAnimation_.setRepeatCount(-1);

  game.getPainter().registerDrawable(dotprod.graphics.Painter.Layer.PROJECTILES, this);
};
goog.inherits(dotprod.model.projectile.BulletSprite, dotprod.model.projectile.Bullet);

/**
 * @override
 */
dotprod.model.projectile.BulletSprite.prototype.advanceTime = function() {
  goog.base(this, 'advanceTime');
  this.animation_.update();
  this.bouncingAnimation_.update();
};

/**
 * @override
 */
dotprod.model.projectile.BulletSprite.prototype.render = function(viewport) {
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);
  var animation = this.bounceCount_ ? this.bouncingAnimation_ : this.animation_;

  animation.render(viewport.getContext(), x, y);
};

/**
 * @override
 */
dotprod.model.projectile.BulletSprite.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  var animation = this.game_.getResourceManager().getVideoEnsemble('explode0').getAnimation(0);
  var explosion = new dotprod.model.Effect(this.game_, animation, this.position_, new dotprod.math.Vector(0, 0));
};

/**
 * @override
 */
dotprod.model.projectile.BulletSprite.prototype.onInvalidate_ = function() {
  this.game_.getPainter().unregisterDrawable(dotprod.graphics.Painter.Layer.PROJECTILES, this);
};
