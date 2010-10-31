/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.PlayerIndex');

goog.require('goog.object');

/**
 * @constructor
 * @param {!dotprod.entities.LocalPlayer} localPlayer
 */
dotprod.PlayerIndex = function(localPlayer) {
  /**
   * @type {!Object.<string, !dotprod.entities.Player>}
   * @private
   */
  this.players_ = {};

  /**
   * @type {!dotprod.entities.LocalPlayer}
   * @private
   */
  this.localPlayer_ = localPlayer;

  this.addPlayer(localPlayer);
};

/**
 * @param {!dotprod.entities.Player} player
 */
dotprod.PlayerIndex.prototype.addPlayer = function(player) {
  goog.object.add(this.players_, player.getName(), player);
};

/**
 * @param {!dotprod.entities.Player} player
 */
dotprod.PlayerIndex.prototype.removePlayer = function(player) {
  goog.object.remove(this.players_, player.getName());
};

/**
 * @param {string} name
 * @return {!dotprod.entities.Player|undefined}
 */
dotprod.PlayerIndex.prototype.findByName = function(name) {
  return this.players_[name];
};

/**
 * @return {!Array.<!dotprod.entities.Player>}
 */
dotprod.PlayerIndex.prototype.getPlayers = function() {
  return goog.object.getValues(this.players_);
};

/**
 * @return {!dotprod.entities.LocalPlayer}
 */
dotprod.PlayerIndex.prototype.getLocalPlayer = function() {
  return this.localPlayer_;
};
