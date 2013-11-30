/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Gun');

goog.require('goog.asserts');
goog.require('dotprod.math.Range');
goog.require('dotprod.model.Weapon.Type');

/**
 * @constructor
 * @implements dotprod.model.Weapon
 * @param {!dotprod.Game} game
 * @param {!Object} gunSettings
 * @param {!dotprod.model.player.Player} owner
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
   * @type {!dotprod.model.player.Player}
   * @private
   */
  this.owner_ = owner;

  /**
   * @type {!dotprod.math.Range}
   * @private
   */
  this.level_ = new dotprod.math.Range(Math.min(0, this.gunSettings_['maxLevel']), this.gunSettings_['maxLevel'], 1);
  this.level_.setValue(this.gunSettings_['initialLevel']);

  /**
   * @type {boolean}
   * @private
   */
  this.bouncingBullets_ = false;
};

/**
 * @override
 */
dotprod.model.Gun.prototype.getType = function() {
  return dotprod.model.Weapon.Type.GUN;
};

/**
 * @return {number}
 */
dotprod.model.Gun.prototype.getLevel = function() {
  return this.level_.getValue();
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
 * @return {Object}
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
  var projectile = this.game_.getModelObjectFactory().newBullet(this.game_, this.owner_, level, position, newVelocity, lifetime, damage, bounceCount);

  this.owner_.addProjectile(projectile);
  this.game_.getResourceManager().playSound('bullet');

  return {
    'type': this.getType(),
    'level': level,
    'pos': position.toArray(),
    'vel': newVelocity.toArray(),
    'bounceCount': bounceCount
  };
};

/**
 * @override
 */
dotprod.model.Gun.prototype.onFired = function(timeDiff, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire gun with incorrect weapon type: ' + weaponData['type']);

  var level = weaponData['level'];
  var position = dotprod.math.Vector.fromArray(weaponData['pos']);
  var velocity = dotprod.math.Vector.fromArray(weaponData['vel']);
  var bounceCount = weaponData['bounceCount'];

  // Make sure the level is correct so the following getters use the right value for their calculations.
  this.level_.setValue(level);

  var projectile = this.game_.getModelObjectFactory().newBullet(this.game_, this.owner_, this.level_.getValue(), position, velocity, this.getLifetime_(), this.getDamage_(), bounceCount);
  for (var i = 0; i < timeDiff; ++i) {
    projectile.advanceTime();
  }

  this.owner_.addProjectile(projectile);
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
