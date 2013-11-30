/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Burst');

goog.require('goog.asserts');
goog.require('dotprod.math.Vector');

/**
 * @constructor
 * @param {!dotprod.Game} game
 * @param {!Object} burstSettings
 * @param {!dotprod.model.player.Player} owner
 */
dotprod.model.Burst = function(game, burstSettings, owner) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = burstSettings;

  /**
   * @type {!dotprod.model.player.Player}
   * @private
   */
  this.owner_ = owner;

  /**
   * @type {number}
   * @private
   */
  this.count_ = this.settings_['initialCount'];
};

/**
 * @override
 */
dotprod.model.Burst.prototype.getType = function() {
  return dotprod.model.Weapon.BURST;
};

/**
 * @return {number}
 */
dotprod.model.Burst.prototype.getCount = function() {
  return this.count_;
};

/**
 * @param {!dotprod.math.Vector} position
 * @param {function(number, number, number): boolean} commitFireFn
 * @return {Object}
 */
dotprod.model.Burst.prototype.fire = function(position, commitFireFn) {
  if (this.count_ <= 0 || !commitFireFn(0 /* fireEnergy */, this.settings_['fireDelay'])) {
    return null;
  }

  --this.count_;
  var shrapnelCount = this.settings_['shrapnelCount'];
  var lifetime = this.settings_['lifetime'];
  var damage = this.settings_['damage'];

  for (var i = 0; i < shrapnelCount; ++i) {
    var velocity = dotprod.math.Vector.fromPolar(this.settings_['speed'], i * 2 * Math.PI / shrapnelCount).add(this.owner_.getVelocity());
    var projectile = this.game_.getModelObjectFactory().newBurst(this.game_, this.owner_, this.owner_.getPosition(), velocity, lifetime, damage);
    this.owner_.addProjectile(projectile);
  }

  return {
    'type': this.getType(),
    'pos': this.owner_.getPosition().toArray(),
    'vel': this.owner_.getVelocity().toArray()
  };
};

/**
 * @override
 */
dotprod.model.Burst.prototype.onFired = function(timeDiff, weaponData) {
  goog.asserts.assert(weaponData['type'] == this.getType(), 'Cannot fire burst with incorrect weapon type: ' + weaponData['type']);

  var position = dotprod.math.Vector.fromArray(weaponData['pos']);
  var velocity = dotprod.math.Vector.fromArray(weaponData['vel']);

  var shrapnelCount = this.settings_['shrapnelCount'];
  var lifetime = this.settings_['lifetime'];
  var damage = this.settings_['damage'];

  for (var i = 0; i < shrapnelCount; ++i) {
    var shrapVel = dotprod.math.Vector.fromPolar(this.settings_['speed'], i * 2 * Math.PI / shrapnelCount).add(velocity);
    var projectile = this.game_.getModelObjectFactory().newBurst(this.game_, this.owner_, position, shrapVel, lifetime, damage);
    for (var j = 0; j < timeDiff; ++j) {
      projectile.advanceTime();
    }
    this.owner_.addProjectile(projectile);
  }
};
