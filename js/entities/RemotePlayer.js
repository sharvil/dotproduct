/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.RemotePlayer');

goog.require('dotprod.Camera');
goog.require('dotprod.entities.Player');
goog.require('dotprod.Map');
goog.require('dotprod.TiledImage');

/**
 * @constructor
 * @extends {dotprod.entities.Player}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Map} map
 * @param {string} name
 * @param {number} ship
 */
dotprod.entities.RemotePlayer = function(game, map, name, ship) {
  dotprod.entities.Player.call(this, name);

  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!dotprod.Map}
   * @private
   */
  this.map_ = map;

  this.image_ = game.getResourceManager().getTiledImage('ship' + ship);
};
goog.inherits(dotprod.entities.RemotePlayer, dotprod.entities.Player);

/**
 * @param {!Object} packet
 */
dotprod.entities.RemotePlayer.prototype.positionUpdate = function(packet) {
  this.angleInRadians_ = packet[1];
  this.position_ = new dotprod.Vector(packet[2], packet[3]);
  this.velocity_ = new dotprod.Vector(packet[4], packet[5]);
};

/**
 * @param {number} timeDiff
 */
dotprod.entities.RemotePlayer.prototype.update = function(timeDiff) {
  // TODO(sharvil): grab from ship settings.
  var bounceFactor = 0.5;
  this.updatePosition_(timeDiff, bounceFactor);
};
