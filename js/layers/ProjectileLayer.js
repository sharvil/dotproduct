/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ProjectileLayer');

goog.require('goog.array');
goog.require('dotprod.Camera');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.Map');
goog.require('dotprod.PlayerIndex');
goog.require('dotprod.ProjectileIndex');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.Map} map
 * @param {!dotprod.PlayerIndex} playerIndex
 * @param {!dotprod.ProjectileIndex} projectileIndex
 */
dotprod.layers.ProjectileLayer = function(map, playerIndex, projectileIndex) {
  /**
   * @type {!dotprod.Map}
   * @private
   */
  this.map_ = map;

  /**
   * @type {!dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = playerIndex;

  /**
   * @type {!dotprod.ProjectileIndex}
   * @private
   */
  this.projectileIndex_ = projectileIndex;
};

/**
 * @override
 */
dotprod.layers.ProjectileLayer.prototype.update = function() {
  var self = this;
  this.projectileIndex_.forEach(function(projectile) {
    projectile.update(self.map_, self.playerIndex_);
  });
};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.ProjectileLayer.prototype.render = function(camera) {
  this.projectileIndex_.forEach(function(projectile) {
    projectile.render(camera);
  });
};
