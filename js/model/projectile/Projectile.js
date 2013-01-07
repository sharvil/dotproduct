/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.projectile.Projectile');

goog.require('dotprod.model.Entity');

/**
 * @constructor
 * @extends {dotprod.model.Entity}
 * @param {!dotprod.Game} game
 * @param {!dotprod.model.player.Player} owner
 * @param {number} level
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
dotprod.model.projectile.Projectile = function(game, owner, level, lifetime, damage, bounceCount) {
  goog.base(this, game);

  /**
   * @type {!dotprod.model.player.Player}
   * @protected
   */
  this.owner_ = owner;

  /**
   * @type {number}
   * @protected
   */
  this.level_ = level;

  /**
   * @type {number}
   * @protected
   */
  this.lifetime_ = lifetime;

  /**
   * @type {number}
   * @protected
   */
  this.damage_ = damage;

  /**
   * @type {number}
   * @protected
   */
  this.bounceCount_ = bounceCount;
};
goog.inherits(dotprod.model.projectile.Projectile, dotprod.model.Entity);

dotprod.model.projectile.Projectile.prototype.getType = goog.abstractMethod;

/**
 * @param {!dotprod.model.player.Player} player
 * @protected
 */
dotprod.model.projectile.Projectile.prototype.checkPlayerCollision_ = goog.abstractMethod;

/**
 * @param {dotprod.model.player.Player} player The player who was directly hit or null if there was no direct hit.
 * @protected
 */
dotprod.model.projectile.Projectile.prototype.explode_ = goog.abstractMethod;

/**
 * @return {number}
 */
dotprod.model.projectile.Projectile.prototype.getLevel = function() {
  return this.level_;
};

/**
 * @return {number}
 */
dotprod.model.projectile.Projectile.prototype.getBounceCount = function() {
  return this.bounceCount_;
};

dotprod.model.projectile.Projectile.prototype.advanceTime = function() {
  if (--this.lifetime_ <= 0) {
    this.invalidate();
    return;
  }

  this.updatePosition_();
  this.game_.getPlayerIndex().some(goog.bind(this.checkPlayerCollision_, this));
};

/**
 * @override
 */
dotprod.model.projectile.Projectile.prototype.bounce_ = function() {
  if (this.bounceCount_ == 0) {
    this.explode_(null);
  } else if (this.bounceCount_ > 0) {
    --this.bounceCount_;
  }
};
