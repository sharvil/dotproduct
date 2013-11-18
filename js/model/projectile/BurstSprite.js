/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.projectile.BurstSprite');

goog.require('dotprod.math.Vector');
goog.require('dotprod.model.projectile.Burst');
goog.require('dotprod.model.Effect');
goog.require('dotprod.graphics.Drawable');
goog.require('dotprod.graphics.Layer');

/**
 * @constructor
 * @extends {dotprod.model.projectile.Mine}
 * @implements {dotprod.graphics.Drawable}
 * @param {!dotprod.Game} game
 * @param {!dotprod.model.player.Player} owner
 * @param {number} level
 * @param {!dotprod.math.Vector} position
 * @param {number} lifetime
 * @param {number} damage
 */
dotprod.model.projectile.BurstSprite = function(game, owner, level, position, lifetime, damage) {
  goog.base(this, game, owner, level, position, lifetime, damage);

  /**
   * @type {!dotprod.graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(5);
  this.animation_.setRepeatCount(-1);

  game.getPainter().registerDrawable(dotprod.graphics.Layer.PROJECTILES, this);
};
goog.inherits(dotprod.model.projectile.BurstSprite, dotprod.model.projectile.Burst);

/**
 * @override
 */
dotprod.model.projectile.BurstSprite.prototype.advanceTime = function() {
  goog.base(this, 'advanceTime');
  this.animation_.update();
};

/**
 * @override
 */
dotprod.model.projectile.BurstSprite.prototype.render = function(viewport) {
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(viewport.getContext(), x, y);
};

/**
 * @override
 */
dotprod.model.projectile.BurstSprite.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getSpriteSheet('explode2').getAnimation(0);
  var explosion = new dotprod.model.Effect(this.game_, animation, this.position_, new dotprod.math.Vector(0, 0));
};

/**
 * @override
 */
dotprod.model.projectile.BurstSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(dotprod.graphics.Layer.PROJECTILES, this);
};
