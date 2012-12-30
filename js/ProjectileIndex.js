/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.ProjectileIndex');

goog.require('goog.array');
goog.require('dotprod.entities.Player');
goog.require('dotprod.entities.Projectile');

/**
 * @constructor
 */
dotprod.ProjectileIndex = function() {
  /**
   * @type {!Array.<!Object>}
   * @private
   */
  this.projectiles_ = [];
};

/**
 * @return {number}
 */
dotprod.ProjectileIndex.prototype.getCount = function() {
  return this.projectiles_.length;
};

/**
 * @param {!dotprod.entities.Player} player
 * @param {!dotprod.entities.Projectile} projectile
 */
dotprod.ProjectileIndex.prototype.addProjectile = function(player, projectile) {
  this.projectiles_.push({player: player, projectile: projectile});
};

/**
 * @param {!dotprod.entities.Player} player
 */
dotprod.ProjectileIndex.prototype.removeProjectiles = function(player) {
  this.projectiles_ = goog.array.filter(this.projectiles_, function(element) {
    return element.player != player;
  });
};

/**
 * @param {function(!dotprod.entities.Projectile)} cb
 */
dotprod.ProjectileIndex.prototype.forEach = function(cb) {
  this.projectiles_ = goog.array.filter(this.projectiles_, function(element) { return element.projectile.isAlive(); });
  goog.array.forEach(this.projectiles_, function(element) {
    if (element.projectile.isAlive()) {
      cb(element.projectile);
    }
  });
};
