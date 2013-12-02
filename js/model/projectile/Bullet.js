/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('model.projectile.Bullet');

goog.require('model.projectile.Projectile');
goog.require('model.Weapon.Type');
goog.require('math.Vector');

/**
 * @constructor
 * @extends {model.projectile.Projectile}
 * @param {!Game} game
 * @param {!model.player.Player} owner
 * @param {number} level
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
model.projectile.Bullet = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  goog.base(this, game, owner, level, lifetime, damage, bounceCount);

  this.position_ = position;
  this.velocity_ = velocity;
};
goog.inherits(model.projectile.Bullet, model.projectile.Projectile);

/**
 * @override
 */
model.projectile.Bullet.prototype.checkPlayerCollision_ = function(player) {
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
model.projectile.Bullet.prototype.explode_ = function(hitPlayer) {
  this.velocity_ = math.Vector.ZERO;
  this.lifetime_ = 0;
  if (hitPlayer) {
    hitPlayer.onDamage(this.owner_, this, this.damage_);
  }
};
