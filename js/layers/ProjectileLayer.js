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
 * @param {!dotprod.Game} game
 */
dotprod.layers.ProjectileLayer = function(game) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!dotprod.ProjectileIndex}
   * @private
   */
  this.projectileIndex_ = game.getProjectileIndex();
};

/**
 * @override
 */
dotprod.layers.ProjectileLayer.prototype.update = function() {
  var self = this;
  this.projectileIndex_.forEach(function(projectile) {
    projectile.update();
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
