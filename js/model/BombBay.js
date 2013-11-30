/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.BombBay');

goog.require('goog.asserts');
goog.require('dotprod.math.Range');
goog.require('dotprod.model.Weapon.Type');

/**
 * @constructor
 * @implements {dotprod.model.Weapon}
 * @param {!dotprod.Game} game
 * @param {!Object} bombBaySettings
 * @param {!dotprod.model.player.Player} owner
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
   * @type {!dotprod.model.player.Player}
   * @private
   */
  this.owner_ = owner;

  /**
   * @type {!dotprod.math.Range}
   * @private
   */
  this.level_ = new dotprod.math.Range(Math.min(0, bombBaySettings['maxLevel']), bombBaySettings['maxLevel'], 1);
  this.level_.setValue(bombBaySettings['initialLevel']);
};

/**
 * @override
 */
dotprod.model.BombBay.prototype.getType = function() {
  return dotprod.model.Weapon.Type.BOMB;
};

/**
 * @return {number}
 */
dotprod.model.BombBay.prototype.getLevel = function() {
  return this.level_.getValue();
};

dotprod.model.BombBay.prototype.upgrade = function() {
  this.level_.increment();
};

/**
 * @param {number} angle
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 * @param {function(number, number, number): boolean} commitFireFn
 * @return {Object}
 */
dotprod.model.BombBay.prototype.fire = function(angle, position, velocity, commitFireFn) {
  var level = this.level_.getValue();
  if(level < 0) {
    return null;
  }

  var fireEnergy = this.getFireEnergy_();
  var fireDelay = this.getFireDelay_();
  var recoilAcceleration = this.getRecoilAcceleration_();

  if (!commitFireFn(fireEnergy, fireDelay, recoilAcceleration)) {
    return null;
  }

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var bounceCount = this.getBounceCount_();
  var blastRadius = this.getBlastRadius_();
  var proxRadius = this.getProxRadius_();
  var newVelocity = velocity.add(dotprod.math.Vector.fromPolar(this.getBombSpeed_(), angle));
  var projectile = this.game_.getModelObjectFactory().newBomb(this.game_, this.owner_, level, position, newVelocity, lifetime, damage, bounceCount, blastRadius, proxRadius);

  this.owner_.addProjectile(projectile);
  this.game_.getResourceManager().playSound('bomb');

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
dotprod.model.BombBay.prototype.onFired = function(timeDiff, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire bomb with incorrect weapon type: ' + weaponData['type']);

  var level = weaponData['level'];
  var position = dotprod.math.Vector.fromArray(weaponData['pos']);
  var velocity = dotprod.math.Vector.fromArray(weaponData['vel']);
  var bounceCount = weaponData['bounceCount'];

  // Make sure the level is correct so the following getters use the right value for their calculations.
  this.level_.setValue(level);

  var projectile = this.game_.getModelObjectFactory().newBomb(this.game_, this.owner_, this.level_.getValue(), position, velocity, this.getLifetime_(), this.getDamage_(), bounceCount, this.getBlastRadius_(), this.getProxRadius_());
  for (var i = 0; i < timeDiff; ++i) {
    projectile.advanceTime();
  }
  this.owner_.addProjectile(projectile);
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
  return this.bombBaySettings_['damage'] + this.level_.getValue() * this.bombBaySettings_['damageUpgrade'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getBlastRadius_ = function() {
  return this.bombBaySettings_['blastRadius'] + this.level_.getValue() * this.bombBaySettings_['blastRadiusUpgrade'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getProxRadius_ = function() {
  return this.bombBaySettings_['proxRadius'] + this.level_.getValue() * this.bombBaySettings_['proxRadiusUpgrade'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.BombBay.prototype.getRecoilAcceleration_ = function() {
  return this.bombBaySettings_['recoilAcceleration'];
};
