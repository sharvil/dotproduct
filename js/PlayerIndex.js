/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.PlayerIndex');

goog.require('goog.object');
goog.require('dotprod.sprites.Sprite');

/**
 * @constructor
 */
dotprod.PlayerIndex = function() {
  /**
   * @type {!Object.<string, !dotprod.sprites.Sprite>}
   * @private
   */
  this.players_ = {};
};

/**
 * @param {!dotprod.sprites.Sprite} player
 */
dotprod.PlayerIndex.prototype.addPlayer = function(player) {
  goog.object.add(this.players_, player.getName(), player);
};

/**
 * @param {!dotprod.sprites.Sprite} player
 */
dotprod.PlayerIndex.prototype.removePlayer = function(player) {
  goog.object.remove(this.players_, player.getName());
};

/**
 * @param {string} name
 * @return {!dotprod.sprites.Sprite|undefined}
 */
dotprod.PlayerIndex.prototype.findByName = function(name) {
  return this.players_[name];
};

/**
 * @return {!Array.<!dotprod.sprites.Sprite>}
 */
dotprod.PlayerIndex.prototype.getPlayers = function() {
  return goog.object.getValues(this.players_);
};
