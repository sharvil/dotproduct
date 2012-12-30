/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Bomb');

goog.require('dotprod.Camera');
goog.require('dotprod.entities.Effect');
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
 * @param {number} blastRadius
 * @param {number} proxRadius
 */
dotprod.entities.Bomb = function(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
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
   * @type {dotprod.entities.Player}
   * @private
   */
   this.proxActivator_;

  /**
   * @type {number}
   * @private
   */
  this.lastDistanceToProxActivator_;
};
goog.inherits(dotprod.entities.Bomb, dotprod.entities.Projectile);

/**
 * @override
 */
dotprod.entities.Bomb.prototype.getType = function() {
  return dotprod.model.Weapon.Type.BOMB;
};

/**
 * @param {!dotprod.Game} game
 */
dotprod.entities.Bomb.prototype.update = function(game) {
  --this.lifetime_;
  if (!this.isAlive()) {
    return;
  }

  this.updatePosition_();
  game.getPlayerIndex().some(goog.bind(this.checkPlayerCollision_, this));
};

/**
 * @private
 * @param {!dotprod.entities.Player} player
 */
dotprod.entities.Bomb.prototype.checkPlayerCollision_ = function(player) {
  if (!player.isAlive() || this.owner_.isFriend(player)) {
    return false;
  }

  var distance = this.position_.subtract(player.getPosition()).magnitude();
  if (player.getDimensions().boundingRect.contains(this.position_)) {
    this.explode_(player == this.game_.getPlayerIndex().getLocalPlayer());
    return true;
  } else if (!this.proxActivator_) {
    if (distance <= this.proxRadius_) {
      this.proxActivator_ = player;
      this.lastDistanceToProxActivator_ = distance;
    }
  } else if (player == this.proxActivator_) {
    if (distance > this.lastDistanceToProxActivator_) {
      this.explode_(false);
      return true;
    }
    this.lastDistanceToProxActivator_ = distance;
  }
  return false;
};

dotprod.entities.Bomb.prototype.bounce_ = function() {
  if (this.bounceCount_ == 0) {
    this.explode_(false);
  } else if (this.bounceCount_ > 0) {
    --this.bounceCount_;
  }
};

/**
 * @protected
 * @param {boolean} directHit True if the local player was hit directly by the bomb, false otherwise.
 */
dotprod.entities.Bomb.prototype.explode_ = function(directHit) {
  // Reset bomb state.
  this.velocity_ = new dotprod.math.Vector(0, 0);
  this.lifetime_ = 0;

  // Figure out how much damage the local player is going to take from this bomb explosion.
  var damageRatio;
  var player = this.game_.getPlayerIndex().getLocalPlayer();
  if (directHit) {
    damageRatio = 1;
  } else {
    var normDistance = this.position_.subtract(player.getPosition()).magnitude() / this.blastRadius_;
    damageRatio = Math.max(1 - normDistance, 0);
  }

  player.takeDamage(this.owner_, this, this.damage_ * damageRatio);
};
