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

dotprod.layers.ShipLayer.prototype.updateShip = function(name, packet) {
  for (var i = 0; i < this.ships_.length; ++i) {
    if (this.ships_[i].name_ == name) {
      this.ships_[i].positionUpdate(packet);
      return;
    }
  }
};

/**
 * @override
 */
dotprod.layers.ShipLayer.prototype.update = function() {
  var players = this.playerIndex_.getPlayers();
  for (var i = 0; i < players.length; ++i) {
    players[i].update();
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

  // TODO(sharvil): this should be moved into a debug console layer.
/*
  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  context.save();
    context.fillStyle = 'rgba(0, 0, 0, 0.25)';
    context.fillRect(0, 0, dimensions.width, dimensions.height);

    context.font = '12px Verdana';
    context.fillStyle = 'rgb(200, 200, 200)';
    for (var i = 0; i < players.length; ++i) {
      var line = players[i].name_ + ' @ ' + Math.floor(players[i].position_.getX()) + ',' + Math.floor(players[i].position_.getY());
      context.fillText(line, 10, 12 * i);
    }
  context.restore();
*/
};
