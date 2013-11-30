/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.projectile.Mine');

goog.require('dotprod.model.projectile.Projectile');
goog.require('dotprod.model.Weapon.Type');
goog.require('dotprod.math.Vector');

/**
 * @constructor
 * @extends {dotprod.model.projectile.Projectile}
 * @param {!dotprod.Game} game
 * @param {!dotprod.model.player.Player} owner
 * @param {number} level
 * @param {!dotprod.math.Vector} position
 * @param {number} lifetime
 * @param {number} damage
 */
dotprod.model.projectile.Mine = function(game, owner, level, position, lifetime, damage) {
  goog.base(this, game, owner, level, lifetime, damage, 0);

  this.position_ = position;
};
goog.inherits(dotprod.model.projectile.Mine, dotprod.model.projectile.Projectile);

/**
 * @override
 */
dotprod.model.projectile.Mine.prototype.checkPlayerCollision_ = function(player) {
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
dotprod.model.projectile.Mine.prototype.explode_ = function(hitPlayer) {
  this.lifetime_ = 0;

  if (hitPlayer) {
    hitPlayer.onDamage(this.owner_, this, this.damage_);
  }
};
