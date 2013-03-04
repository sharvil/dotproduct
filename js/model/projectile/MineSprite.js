/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.projectile.MineSprite');

goog.require('dotprod.math.Vector');
goog.require('dotprod.model.projectile.Mine');
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
dotprod.model.projectile.MineSprite = function(game, owner, level, position, lifetime, damage) {
  goog.base(this, game, owner, level, position, lifetime, damage);

  /**
   * @type {!dotprod.graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('mines').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  game.getPainter().registerDrawable(dotprod.graphics.Layer.PROJECTILES, this);
};
goog.inherits(dotprod.model.projectile.MineSprite, dotprod.model.projectile.Mine);

/**
 * @override
 */
dotprod.model.projectile.MineSprite.prototype.advanceTime = function() {
  goog.base(this, 'advanceTime');
  this.animation_.update();
};

/**
 * @override
 */
dotprod.model.projectile.MineSprite.prototype.render = function(viewport) {
  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(viewport.getContext(), x, y);
};

/**
 * @override
 */
dotprod.model.projectile.MineSprite.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getSpriteSheet('explode2').getAnimation(0);
  var explosion = new dotprod.model.Effect(this.game_, animation, this.position_, new dotprod.math.Vector(0, 0));
};

/**
 * @override
 */
dotprod.model.projectile.MineSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(dotprod.graphics.Layer.PROJECTILES, this);
};
