/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.PlayerIndex');

goog.require('goog.object');

/**
 * @constructor
 * @param {!dotprod.model.player.LocalPlayer} localPlayer
 */
dotprod.PlayerIndex = function(localPlayer) {
  /**
   * @type {!Object.<string, !dotprod.model.player.Player>}
   * @private
   */
  this.players_ = {};

  /**
   * @type {!dotprod.model.player.LocalPlayer}
   * @private
   */
  this.localPlayer_ = localPlayer;

  this.addPlayer(localPlayer);
};

/**
 * @param {!dotprod.model.player.Player} player
 */
dotprod.PlayerIndex.prototype.addPlayer = function(player) {
  goog.object.add(this.players_, player.getId(), player);
};

/**
 * @param {!dotprod.model.player.Player} player
 */
dotprod.PlayerIndex.prototype.removePlayer = function(player) {
  player.invalidate();
  goog.object.remove(this.players_, player.getId());
};

/**
 * @param {string} id
 * @return {!dotprod.model.player.Player|undefined}
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
 * @param {function(!dotprod.model.player.Player)} cb
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
 * @param {function(!dotprod.model.player.Player): boolean} cb
 */
dotprod.PlayerIndex.prototype.some = function(cb) {
  goog.object.some(this.players_, cb);
};

/**
 * @return {!dotprod.model.player.LocalPlayer}
 */
dotprod.PlayerIndex.prototype.getLocalPlayer = function() {
  return this.localPlayer_;
};
