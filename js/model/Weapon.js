/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('model.Weapon');
goog.provide('model.Weapon.Type');

/**
 * @interface
 */
model.Weapon = function() {};

/**
 * @return {model.Weapon.Type}
 */
model.Weapon.prototype.getType = function() {};

/**
 * @param {number} timeDiff
 * @param {!Object} weaponData
 */
model.Weapon.prototype.onFired = function(timeDiff, weaponData) {};

/**
 * @enum {number}
 */
model.Weapon.Type = {
  GUN: 1,
  BOMB: 2,
  MINE: 3,
  BURST: 4
};
