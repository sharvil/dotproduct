/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.BulletSprite');

goog.require('dotprod.entities.Bullet');
goog.require('dotprod.entities.Effect');
goog.require('dotprod.math.Vector');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @extends {dotprod.entities.Bullet}
 * @implements {dotprod.sprites.Sprite}
 * @param {!dotprod.Game} game
 * @param {!dotprod.entities.Player} owner
 * @param {number} level
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
dotprod.sprites.BulletSprite = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  goog.base(this, game, owner, level, position, velocity, lifetime, damage, bounceCount);

  /**
   * @type {!dotprod.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getVideoEnsemble('bullets').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {!dotprod.Animation}
   * @private
   */
   this.bouncingAnimation_ = game.getResourceManager().getVideoEnsemble('bullets').getAnimation(5 + level);
   this.bouncingAnimation_.setRepeatCount(-1);
};
goog.inherits(dotprod.sprites.BulletSprite, dotprod.entities.Bullet);

/**
 * @override
 */
dotprod.sprites.BulletSprite.prototype.update = function() {
  goog.base(this, 'update');
  this.animation_.update();
  this.bouncingAnimation_.update();
};

/**
 * @override
 */
dotprod.sprites.BulletSprite.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

  var dimensions = camera.getDimensions();
  var x = Math.floor(this.position_.getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.animation_.getHeight() / 2);
  var animation = this.bounceCount_ ? this.bouncingAnimation_ : this.animation_;

  animation.render(camera.getContext(), x, y);
};

/**
 * @override
 */
dotprod.sprites.BulletSprite.prototype.explode_ = function(hitPlayer) {
  goog.base(this, 'explode_', hitPlayer);

  var animation = this.game_.getResourceManager().getVideoEnsemble('explode0').getAnimation(0);
  var explosion = new dotprod.entities.Effect(animation, this.position_, new dotprod.math.Vector(0, 0));
  this.game_.getEffectIndex().addEffect(explosion);
};
