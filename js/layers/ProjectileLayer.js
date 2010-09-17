/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ProjectileLayer');

goog.require('goog.array');
goog.require('dotprod.Camera');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.ProjectileIndex');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.ProjectileIndex} projectileIndex
 */
dotprod.layers.ProjectileLayer = function(projectileIndex) {
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
  var projectiles = this.projectileIndex_.getProjectiles();
  for (var i = 0; i < projectiles.length; ++i) {
    projectiles[i].update();
  }
};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.ProjectileLayer.prototype.render = function(camera) {
  var projectiles = this.projectileIndex_.getProjectiles();
  for (var i = 0; i < projectiles.length; ++i) {
    projectiles[i].render(camera);
  }
};
