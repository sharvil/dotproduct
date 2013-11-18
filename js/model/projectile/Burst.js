/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.projectile.Burst');

goog.require('dotprod.model.projectile.Projectile');
goog.require('dotprod.model.Weapon.Type');
goog.require('dotprod.math.Vector');

/**
 * @constructor
 * @extends {dotprod.model.projectile.Projectile}
 * @param {!dotprod.Game} game
 * @param {!dotprod.model.player.Player} owner
 * @param {number} shrapnelCount
 * @param {!dotprod.math.Vector} position
 * @param {number} lifetime
 * @param {number} damage
 */
dotprod.model.projectile.Burst = function(game, owner, shrapnelCount, position, lifetime, damage) {
  goog.base(this, game, owner, 0, lifetime, damage, 1);

  this.position_ = position;
};
goog.inherits(dotprod.model.projectile.Burst, dotprod.model.projectile.Projectile);

/**
 * @override
 */
dotprod.model.projectile.Burst.prototype.getType = function() {
  return dotprod.model.Weapon.Type.BURST;
};

/**
 * @override
 */
dotprod.model.projectile.Burst.prototype.checkPlayerCollision_ = function(player) {
  if (!player.isAlive() || this.owner_.isFriend(player)) {
    return false;
  }

  if (player.getDimensions().boundingRect.contains(this.position_)) {
    this.explode_(player);
    return true;
  }
  return false;
};

/**
 * @override
 */
dotprod.model.projectile.Burst.prototype.explode_ = function(hitPlayer) {
  this.lifetime_ = 0;

  if (hitPlayer) {
    hitPlayer.onDamage(this.owner_, this, this.damage_);
  }
};
