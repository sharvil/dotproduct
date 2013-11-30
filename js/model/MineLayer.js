/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.MineLayer');

goog.require('goog.asserts');
goog.require('dotprod.math.Range');
goog.require('dotprod.model.Weapon.Type');

/**
 * @constructor
 * @implements dotprod.model.Weapon
 * @param {!dotprod.Game} game
 * @param {!Object} bombBaySettings
 * @param {!dotprod.model.player.Player} owner
 */
dotprod.model.MineLayer = function(game, bombBaySettings, owner) {
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
dotprod.model.MineLayer.prototype.getType = function() {
  return dotprod.model.Weapon.Type.MINE;
};

/**
 * @return {number}
 */
dotprod.model.MineLayer.prototype.getLevel = function() {
  return this.level_.getValue();
};

dotprod.model.MineLayer.prototype.upgrade = function() {
  this.level_.increment();
};

/**
 * @param {!dotprod.math.Vector} position
 * @param {function(number, number): boolean} commitFireFn
 * @return {Object}
 */
dotprod.model.MineLayer.prototype.fire = function(position, commitFireFn) {
  var level = this.level_.getValue();
  if(level < 0) {
    return null;
  }

  var fireEnergy = this.getFireEnergy_();
  var fireDelay = this.getFireDelay_();

  if (!commitFireFn(fireEnergy, fireDelay)) {
    return null;
  }

  var lifetime = this.getLifetime_();
  var damage = this.getDamage_();
  var projectile = this.game_.getModelObjectFactory().newMine(this.game_, this.owner_, level, position, lifetime, damage);

  this.onwer_.addProjectile(projectile);
  this.game_.getResourceManager().playSound('mine');

  return {
    'type': this.getType(),
    'level': level,
    'pos': position.toArray()
  };
};

/**
 * @override
 */
dotprod.model.MineLayer.prototype.onFired = function(timeDiff, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire mine with incorrect weapon type: ' + weaponData['type']);

  var level = weaponData['level'];
  var position = dotprod.math.Vector.fromArray(weaponData['pos']);

  // Make sure the level is correct so the following getters use the right value for their calculations.
  this.level_.setValue(level);

  var projectile = this.game_.getModelObjectFactory().newMine(this.game_, this.owner_, this.level_.getValue(), position, this.getLifetime_(), this.getDamage_());
  for (var i = 0; i < timeDiff; ++i) {
    projectile.advanceTime();
  }
  this.owner_.addProjectile(projectile);
};

/**
 * @return {number}
 * @private
 */
dotprod.model.MineLayer.prototype.getFireDelay_ = function() {
  return this.bombBaySettings_['fireDelay'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.MineLayer.prototype.getFireEnergy_ = function() {
  return this.bombBaySettings_['fireEnergy'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.MineLayer.prototype.getLifetime_ = function() {
  return this.bombBaySettings_['lifetime'];
};

/**
 * @return {number}
 * @private
 */
dotprod.model.MineLayer.prototype.getDamage_ = function() {
  return this.bombBaySettings_['damage'] + this.level_.getValue() * this.bombBaySettings_['damageUpgrade'];
};
