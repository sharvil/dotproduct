/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Gun');

goog.require('dotprod.entities.Bullet');
goog.require('dotprod.math.Range');

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
   * @type {!dotprod.math.Range}
   * @private
   */
  this.level_ = new dotprod.math.Range(Math.min(0, this.gunSettings_['maxLevel']), this.gunSettings_['maxLevel'], 1);

  /**
   * @type {boolean}
   * @private
   */
  this.bouncingBullets_ = false;
};

dotprod.model.Gun.prototype.upgrade = function() {
  this.level_.increment();
};

/**
 * @param {boolean} bounces
 */
dotprod.model.Gun.prototype.setBounces = function(bounces) {
  this.bouncingBullets_ = bounces;
};

/**
 * @param {number} angle
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {function(number, number): boolean} commitFireFn
 * @return {dotprod.entities.Projectile}
 */
dotprod.model.Gun.prototype.fire = function(angle, position, velocity, commitFireFn) {
  var fireEnergy = this.getFireEnergy_();
  var fireDelay = this.getFireDelay_();
  var level = this.level_.getValue();

  if (level < 0 || !commitFireFn(fireEnergy, fireDelay)) {
    return null;
  }

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var bounceCount = this.getBounceCount_();
  var newVelocity = velocity.add(dotprod.math.Vector.fromPolar(this.getBulletSpeed_(), angle));
  var projectile = new dotprod.entities.Bullet(this.game_, this.owner_, level, position, newVelocity, lifetime, damage, bounceCount);

  // TODO(sharvil): this should probably happen in the projectile base class' constructor.
  this.game_.getProjectileIndex().addProjectile(this.owner_, projectile);
  this.game_.getResourceManager().playSound('bullet');

  return projectile;
};

/**
 * @param {number} level
 * @param {number} bounceCount
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @return {dotprod.entities.Projectile}
 */
dotprod.model.Gun.prototype.fireSynthetic = function(level, bounceCount, position, velocity) {
  this.level_.setValue(level);

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();

  var projectile = new dotprod.entities.Bullet(this.game_, this.owner_, this.level_.getValue(), position, velocity, lifetime, damage, bounceCount);
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
  return this.gunSettings_['fireEnergy'] * (this.level_.getValue() + 1);
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
  return this.gunSettings_['damage'] + this.level_.getValue() * this.gunSettings_['damageUpgrade'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.Gun.prototype.getBounceCount_ = function() {
  return this.gunSettings_['bounces'] && this.bouncingBullets_ ? -1 : 0;
};
