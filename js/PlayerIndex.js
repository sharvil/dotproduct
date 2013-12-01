/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('PlayerIndex');

goog.require('goog.object');

/**
 * @constructor
 * @param {!model.player.LocalPlayer} localPlayer
 */
PlayerIndex = function(localPlayer) {
  /**
   * @type {!Object.<string, !model.player.Player>}
   * @private
   */
  this.players_ = {};

  /**
   * @type {!model.player.LocalPlayer}
   * @private
   */
  this.localPlayer_ = localPlayer;

  this.addPlayer(localPlayer);
};

/**
 * @param {!model.player.Player} player
 */
PlayerIndex.prototype.addPlayer = function(player) {
  goog.object.add(this.players_, player.getId(), player);
};

/**
 * @param {!model.player.Player} player
 */
PlayerIndex.prototype.removePlayer = function(player) {
  player.invalidate();
  goog.object.remove(this.players_, player.getId());
};

/**
 * @param {string} id
 * @return {!model.player.Player|undefined}
 */
PlayerIndex.prototype.findById = function(id) {
  return this.players_[id];
};

/**
 * @return {number}
 */
PlayerIndex.prototype.getCount = function() {
  return goog.object.getCount(this.players_);
};

/**
 * @param {function(!model.player.Player)} cb
 * @param {function(*, *): number=} opt_compareFn
 */
PlayerIndex.prototype.forEach = function(cb, opt_compareFn) {
  var players = goog.object.getValues(this.players_);
  if (opt_compareFn) {
    goog.array.stableSort(players, opt_compareFn);
  }
  goog.array.forEach(players, cb);
};

/**
 * @param {function(!model.player.Player): boolean} cb
 */
PlayerIndex.prototype.some = function(cb) {
  goog.object.some(this.players_, cb);
};

/**
 * @return {!model.player.LocalPlayer}
 */
PlayerIndex.prototype.getLocalPlayer = function() {
  return this.localPlayer_;
};
