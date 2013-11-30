/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Weapon');
goog.provide('dotprod.model.Weapon.Type');

/**
 * @interface
 */
dotprod.model.Weapon = function() {};

/**
 * @return {dotprod.model.Weapon.Type}
 */
dotprod.model.Weapon.prototype.getType = function() {};

/**
 * @param {number} timeDiff
 * @param {!Object} weaponData
 */
dotprod.model.Weapon.prototype.onFired = function(timeDiff, weaponData) {};

/**
 * @enum {number}
 */
dotprod.model.Weapon.Type = {
  GUN: 1,
  BOMB: 2,
  MINE: 3,
  BURST: 4
};
