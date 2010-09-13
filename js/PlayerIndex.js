/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.PlayerIndex');

goog.require('goog.object');
goog.require('dotprod.entities.Player');

/**
 * @constructor
 */
dotprod.PlayerIndex = function() {
  /**
   * @type {!Object.<string, !dotprod.entities.Player>}
   * @private
   */
  this.players_ = {};
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
