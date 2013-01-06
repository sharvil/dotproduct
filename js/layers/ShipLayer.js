/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ShipLayer');

goog.require('dotprod.Viewport');
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
 * @deprecated
 * @override
 */
dotprod.layers.ShipLayer.prototype.update = goog.nullFunction;

/**
 * @param {!dotprod.Viewport} viewport
 * @override
 */
dotprod.layers.ShipLayer.prototype.render = function(viewport) {
  // Always draw local player last so we never fly under any other ships.
  var localPlayer = this.playerIndex_.getLocalPlayer();
  this.playerIndex_.forEach(function(player) {
    if (player != localPlayer) {
      player.render(viewport);
    }
  });
  localPlayer.render(viewport);
};
