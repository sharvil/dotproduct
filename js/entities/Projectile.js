/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Projectile');

goog.require('goog.asserts');
goog.require('dotprod.entities.Entity');
goog.require('dotprod.model.Weapon.Type');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 * @param {!dotprod.Game} game
 * @param {!dotprod.entities.Player} owner
 * @param {number} level
 * @param {number} lifetime
 * @param {number} damage
 * @param {number} bounceCount
 */
dotprod.entities.Projectile = function(game, owner, level, lifetime, damage, bounceCount) {
  dotprod.entities.Entity.call(this);

  /**
   * @type {!dotprod.Game}
   * @protected
   */
  this.game_ = game;

  /**
   * @type {!dotprod.entities.Player}
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
goog.inherits(dotprod.entities.Projectile, dotprod.entities.Entity);

/**
 * @return {boolean}
 */
dotprod.entities.Projectile.prototype.isAlive = function() {
  return this.lifetime_ >= 0;
};

/**
 * @return {number}
 */
dotprod.entities.Projectile.prototype.getLevel = function() {
  return this.level_;
};

/**
 * @return {number}
 */
dotprod.entities.Projectile.prototype.getBounceCount = function() {
  return this.bounceCount_;
};

dotprod.entities.Projectile.prototype.getType = goog.abstractMethod;
