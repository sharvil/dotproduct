/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Bullet');

goog.require('dotprod.entities.Projectile');
goog.require('dotprod.model.Weapon.Type');
goog.require('dotprod.math.Vector');

/**
 * @constructor
 * @extends {dotprod.entities.Projectile}
 * @param {!dotprod.Game} game
 * @param {!dotprod.entities.Player} owner
 * @param {number} level
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
dotprod.entities.Bullet = function(game, owner, level, position, velocity, lifetime, damage, bounceCount) {
  goog.base(this, game, owner, level, lifetime, damage, bounceCount);

  this.position_ = position;
  this.velocity_ = velocity;
};
goog.inherits(dotprod.entities.Bullet, dotprod.entities.Projectile);

/**
 * @override
 */
dotprod.entities.Bullet.prototype.getType = function() {
  return dotprod.model.Weapon.Type.BULLET;
};

/**
 * @param {!dotprod.Game} game
 */
dotprod.entities.Bullet.prototype.update = function(game) {
  --this.lifetime_;
  if (!this.isAlive()) {
    return;
  }

  this.updatePosition_();
  game.getPlayerIndex().some(goog.bind(this.checkPlayerCollision_, this));
};

/**
 * @param {!dotprod.entities.Player} player
 */
dotprod.entities.Bullet.prototype.checkPlayerCollision_ = function(player) {
  if (!player.isAlive() || this.owner_.isFriend(player)) {
    return false;
  }

  if (player.getDimensions().boundingRect.contains(this.position_)) {
    player.takeDamage(this.owner_, this, this.damage_);
    this.lifetime_ = 0;
    this.explode_();
    return true;
  }
  return false;
};

dotprod.entities.Bullet.prototype.bounce_ = function() {
  if (this.bounceCount_ == 0) {
    this.velocity_ = new dotprod.math.Vector(0, 0);
    this.lifetime_ = 0;
    this.explode_();
  } else if (this.bounceCount_ > 0) {
    --this.bounceCount_;
  }
};

/**
 * @protected
 */
dotprod.entities.Bullet.prototype.explode_ = goog.nullFunction;
