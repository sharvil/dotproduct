/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.ProjectileIndex');

goog.require('goog.array');
goog.require('dotprod.entities.Entity');

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
 * @param {!dotprod.entities.Entity} player
 * @param {!dotprod.entities.Entity} projectile
 */
dotprod.ProjectileIndex.prototype.addProjectile = function(player, projectile) {
  this.projectiles_.push({player: player, projectile: projectile});
};

/**
 * @param {!dotprod.entities.Entity} player
 */
dotprod.ProjectileIndex.prototype.removeProjectiles = function(player) {
  goog.array.removeIf(this.projectiles_, function(element) {
    return element.player == player;
  });
};

/**
 * @return {!Array.<!dotprod.entities.Entity>}
 */
dotprod.ProjectileIndex.prototype.getProjectiles = function() {
  goog.array.removeIf(this.projectiles_, function(element) {
    return !element.projectile.isAlive();
  });

  return goog.array.map(this.projectiles_, function(element) {
    return element.projectile;
  });
};
