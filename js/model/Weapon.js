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
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {!Object} weaponData
 */
model.Weapon.prototype.onFired = function(timeDiff, position, velocity, weaponData) {};

/**
 * @enum {number}
 */
model.Weapon.Type = {
  GUN: 1,
  BOMB: 2,
  BURST: 3,
  DECOY: 4,
  REPEL: 5
};
