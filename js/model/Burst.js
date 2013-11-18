/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Burst');

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
 * @param {!dotprod.math.Vector} position
 * @param {function(number, number, number): boolean} commitFireFn
 * @return {dotprod.model.projectile.Projectile}
 */
dotprod.model.Burst.prototype.fire = function(position, commitFireFn) {
  if (this.count_ <= 0 || !commitFireFn(0 /* fireEnergy */, 0)) {
    return null;
  }
  // return a new burst projectile
  --this.count_;
  var lifetime = this.settings_['lifetime'];
  var damage = this.settings_['damage'];
  var shrapnelCount = this.settings_['shrapnelCount'];
  return null;
};

dotprod.model.Burst.prototype.fireSynthetic = function() {
  return null;
};
