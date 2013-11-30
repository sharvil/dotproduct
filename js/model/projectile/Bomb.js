/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.projectile.Bomb');

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
 * @param {!dotprod.math.Vector} velocity
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 * @param {number} blastRadius
 * @param {number} proxRadius
 */
dotprod.model.projectile.Bomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
  goog.base(this, game, owner, level, lifetime, damage, bounceCount);

  this.position_ = position;
  this.velocity_ = velocity;

  /**
   * @type {number}
   * @private
   */
  this.blastRadius_ = blastRadius;

  /**
   * @type {number}
   * @private
   */
  this.proxRadius_ = proxRadius;

  /**
   * @type {dotprod.model.player.Player}
   * @private
   */
   this.proxActivator_;

  /**
   * @type {number}
   * @private
   */
  this.lastDistanceToProxActivator_;
};
goog.inherits(dotprod.model.projectile.Bomb, dotprod.model.projectile.Projectile);

/**
 * @override
 */
dotprod.model.projectile.Bomb.prototype.checkPlayerCollision_ = function(player) {
  if (!player.isAlive() || this.owner_.isFriend(player)) {
    return false;
  }

  var distance = this.position_.subtract(player.getPosition()).magnitude();
  if (player.getDimensions().boundingRect.contains(this.position_)) {
    this.explode_(player);
    return true;
  } else if (!this.proxActivator_) {
    if (distance <= this.proxRadius_) {
      this.proxActivator_ = player;
      this.lastDistanceToProxActivator_ = distance;
    }
  } else if (player == this.proxActivator_) {
    if (distance > this.lastDistanceToProxActivator_) {
      this.explode_(null);
      return true;
    }
    this.lastDistanceToProxActivator_ = distance;
  }
  return false;
};

/**
 * @override
 */
dotprod.model.projectile.Bomb.prototype.explode_ = function(hitPlayer) {
  // Reset bomb state.
  this.velocity_ = new dotprod.math.Vector(0, 0);
  this.lifetime_ = 0;

  // Figure out how much damage the local player is going to take from this bomb explosion.
  var damageRatio;
  var localPlayer = this.game_.getPlayerIndex().getLocalPlayer();
  if (hitPlayer == localPlayer) {
    damageRatio = 1;
  } else {
    var normDistance = this.position_.subtract(localPlayer.getPosition()).magnitude() / this.blastRadius_;
    damageRatio = Math.max(1 - normDistance, 0);
  }

  localPlayer.onDamage(this.owner_, this, this.damage_ * damageRatio);
};
