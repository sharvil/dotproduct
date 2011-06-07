/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Gun');

goog.require('dotprod.entities.Bullet');

/**
 * @constructor
 * @param {!dotprod.Game} game
 * @param {!Object} gunSettings
 * @param {!dotprod.entities.Player} owner
 */
dotprod.model.Gun = function(game, gunSettings, owner) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.gunSettings_ = gunSettings;

  /**
   * @type {!dotprod.entities.Player}
   * @private
   */
  this.owner_ = owner;

  /**
   * @type {number}
   * @private
   */
  this.level_ = 0;
};

dotprod.model.Gun.prototype.upgrade = function() {
  this.level_ = Math.min(this.level_ + 1, this.gunSettings_['maxLevel']);
};

/**
 * @param {number} angle
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 * @param {function(number, number): boolean} commitFireFn
 * @return {dotprod.entities.Projectile}
 */
dotprod.model.Gun.prototype.fire = function(angle, position, velocity, commitFireFn) {
  var fireEnergy = this.getFireEnergy_();
  var fireDelay = this.getFireDelay_();

  if (!commitFireFn(fireEnergy, fireDelay)) {
    return null;
  }

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var newVelocity = velocity.add(dotprod.Vector.fromPolar(this.getBulletSpeed_(), angle));
  var projectile = new dotprod.entities.Bullet(this.game_, this.owner_, this.level_, position, newVelocity, lifetime, damage, 0);

  // TODO(sharvil): this should probably happen in the projectile base class' constructor.
  this.game_.getProjectileIndex().addProjectile(this.owner_, projectile);
  this.game_.getResourceManager().playSound('bullet');

  return projectile;
};

/**
 * @param {number} level
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 * @return {dotprod.entities.Projectile}
 */
dotprod.model.Gun.prototype.fireSynthetic = function(level, position, velocity) {
  this.level_ = level;

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();

  var projectile = new dotprod.entities.Bullet(this.game_, this.owner_, this.level_, position, velocity, lifetime, damage, 0);
  this.game_.getProjectileIndex().addProjectile(this.owner_, projectile);
  return projectile;
};

/**
 * @return {number}
 * @private
 */
dotprod.model.Gun.prototype.getFireDelay_ = function() {
  return this.gunSettings_['fireDelay'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.Gun.prototype.getFireEnergy_ = function() {
  return this.gunSettings_['fireEnergy'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.Gun.prototype.getBulletSpeed_ = function() {
  return this.gunSettings_['speed'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.Gun.prototype.getLifetime_ = function() {
  return this.gunSettings_['lifetime'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.Gun.prototype.getDamage_ = function() {
  return this.gunSettings_['damage'] + this.level_ * this.gunSettings_['damageUpgrade'];
};
