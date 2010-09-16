/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ShipLayer');

goog.require('dotprod.Camera');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.PlayerIndex');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 */
dotprod.layers.ShipLayer = function(playerIndex) {
  /**
   * @type {!dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = playerIndex;
};

dotprod.layers.ShipLayer.prototype.updateShip = function(name, packet) {
  for (var i = 0; i < this.ships_.length; ++i) {
    if (this.ships_[i].name_ == name) {
      this.ships_[i].positionUpdate(packet);
      return;
    }
  }
};

/**
 * @param {number} timeDiff
 * @override
 */
dotprod.layers.ShipLayer.prototype.update = function(timeDiff) {
  var players = this.playerIndex_.getPlayers();
  for (var i = 0; i < players.length; ++i) {
    players[i].update(timeDiff);
  }
};

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.ShipLayer.prototype.render = function(camera) {
  var players = this.playerIndex_.getPlayers();
  for (var i = players.length - 1; i >= 0; --i) {
    players[i].render(camera);
  }
};
