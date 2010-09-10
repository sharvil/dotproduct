/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ProjectileLayer');

goog.require('dotprod.Camera');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 */
dotprod.layers.ProjectileLayer = function() {
  /**
   * @type {!Object.<string, !Array.<dotprod.sprites.Sprite>>}
   * @private
   */
  this.projectiles_ = {};
};

/**
 * @param {string} player
 * @param {!dotprod.sprites.Sprite} projectile
 */
dotprod.layers.ProjectileLayer.prototype.addProjectile = function(player, projectile) {
  if (!this.projectiles_[player]) {
    this.projectiles_[player] = [projectile];
  } else {
    this.projectiles_[player].push(projectile);
  }
};

/**
 * @param {string} player
 */
dotprod.layers.ProjectileLayer.prototype.removeProjectiles = function(player) {
  this.projectiles_[player] = [];
};

/**
 * @param {number} timeDiff
 * @override
 */
dotprod.layers.ProjectileLayer.prototype.update = function(timeDiff) {
  for (var j in this.projectiles_) {
    var newList = [];
    for (var i = 0; i < this.projectiles_[j].length; ++i) {
      this.projectiles_[j][i].update(timeDiff);
      if (this.projectiles_[j][i].isAlive()) {
        newList.push(this.projectiles_[j][i]);
      }
    }

    // TODO(sharvil): does iteration break if we modify the object?
    if (!newList.length) {
      delete this.projectiles_[j];
    } else {
      this.projectiles_[j] = newList;
    }
  }
};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.ProjectileLayer.prototype.render = function(camera) {
  for (var j in this.projectiles_) {
    for (var i = 0; i < this.projectiles_[j].length; ++i) {
      this.projectiles_[j][i].render(camera);
    }
  }
};
