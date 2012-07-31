/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.BombBay');

goog.require('dotprod.entities.Bomb');

/**
 * @constructor
 * @param {!dotprod.Game} game
 * @param {!Object} bombBaySettings
 * @param {!dotprod.entities.Player} owner
 */
dotprod.model.BombBay = function(game, bombBaySettings, owner) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.bombBaySettings_ = bombBaySettings;

  /**
   * @type {!dotprod.entities.Player}
   * @private
   */
  this.owner_ = owner;

  /**
   * @type {number}
   * @private
   */
  this.level_ = Math.min(0, bombBaySettings['maxLevel']);
};

dotprod.model.BombBay.prototype.upgrade = function() {
  this.level_ = Math.min(this.level_ + 1, this.bombBaySettings_['maxLevel']);
};

/**
 * @param {number} angle
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 * @param {function(number, number): boolean} commitFireFn
 * @return {dotprod.entities.Projectile}
 */
dotprod.model.BombBay.prototype.fire = function(angle, position, velocity, commitFireFn) {
  if(this.level_ < 0) {
    return null;
  }

  var fireEnergy = this.getFireEnergy_();
  var fireDelay = this.getFireDelay_();

  if (!commitFireFn(fireEnergy, fireDelay)) {
    return null;
  }

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var bounceCount = this.getBounceCount_();
  var blastRadius = this.getBlastRadius_();
  var newVelocity = velocity.add(dotprod.Vector.fromPolar(this.getBombSpeed_(), angle));
  var projectile = new dotprod.entities.Bomb(this.game_, this.owner_, this.level_, position, newVelocity, lifetime, damage, bounceCount, blastRadius);

  // TODO(sharvil): this should probably happen in the projectile base class' constructor.
  this.game_.getProjectileIndex().addProjectile(this.owner_, projectile);
  this.game_.getResourceManager().playSound('bomb');

  return projectile;
};

/**
 * @param {number} level
 * @param {number} bounceCount
 * @param {!dotprod.Vector} position
 * @param {!dotprod.Vector} velocity
 * @return {dotprod.entities.Projectile}
 */
dotprod.model.BombBay.prototype.fireSynthetic = function(level, bounceCount, position, velocity) {
  this.level_ = level;

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var blastRadius = this.getBlastRadius_();

  var projectile = new dotprod.entities.Bomb(this.game_, this.owner_, this.level_, position, velocity, lifetime, damage, bounceCount, blastRadius);
  this.game_.getProjectileIndex().addProjectile(this.owner_, projectile);
  return projectile;
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getFireDelay_ = function() {
  return this.bombBaySettings_['fireDelay'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getFireEnergy_ = function() {
  return this.bombBaySettings_['fireEnergy'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getBombSpeed_ = function() {
  return this.bombBaySettings_['speed'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getBounceCount_ = function() {
  return this.bombBaySettings_['bounceCount'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getLifetime_ = function() {
  return this.bombBaySettings_['lifetime'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getDamage_ = function() {
  return this.bombBaySettings_['damage'] + this.level_ * this.bombBaySettings_['damageUpgrade'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getBlastRadius_ = function() {
  return this.bombBaySettings_['blastRadius'] + this.level_ * this.bombBaySettings_['blastRadiusUpgrade'];
};
