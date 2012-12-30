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
  goog.object.add(this.players_, player.getId(), player);
};

/**
 * @param {!dotprod.entities.Player} player
 */
dotprod.PlayerIndex.prototype.removePlayer = function(player) {
  goog.object.remove(this.players_, player.getId());
};

/**
 * @param {string} id
 * @return {!dotprod.entities.Player|undefined}
 */
dotprod.PlayerIndex.prototype.findById = function(id) {
  return this.players_[id];
};

/**
 * @return {number}
 */
dotprod.PlayerIndex.prototype.getCount = function() {
  return goog.object.getCount(this.players_);
};

/**
 * @param {function(!dotprod.entities.Player)} cb
 * @param {function(*, *): number=} opt_compareFn
 */
dotprod.PlayerIndex.prototype.forEach = function(cb, opt_compareFn) {
  var players = goog.object.getValues(this.players_);
  if (opt_compareFn) {
    goog.array.stableSort(players, opt_compareFn);
  }
  goog.array.forEach(players, cb);
};

/**
 * @param {function(!dotprod.entities.Player): boolean} cb
 */
dotprod.PlayerIndex.prototype.some = function(cb) {
  goog.object.some(this.players_, cb);
};

/**
 * @return {!dotprod.entities.LocalPlayer}
 */
dotprod.PlayerIndex.prototype.getLocalPlayer = function() {
  return this.localPlayer_;
};
