/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ShipLayer');

goog.require('dotprod.Camera');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.Map');
goog.require('dotprod.PlayerIndex');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.PlayerIndex} playerIndex
 */
dotprod.layers.ShipLayer = function(playerIndex) {
  /**
   * @type {!dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = playerIndex;
};

/**
 * @override
 */
dotprod.layers.ShipLayer.prototype.update = function() {
  this.playerIndex_.forEach(function(player) {
    player.update();
  });
};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.ShipLayer.prototype.render = function(camera) {
  // Always draw local player last so we never fly under any other ships.
  var localPlayer = this.playerIndex_.getLocalPlayer();
  this.playerIndex_.forEach(function(player) {
    if (player != localPlayer) {
      player.render(camera);
    }
  });
  localPlayer.render(camera);
};
