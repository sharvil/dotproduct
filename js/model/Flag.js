/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Flag');

goog.require('dotprod.TileType');

/**
 * @constructor
 * @param {!dotprod.Game} game
 * @param {!dotprod.model.Map} map
 * @param {number} id
 * @param {number} team
 * @param {number} xTile
 * @param {number} yTile
 */
dotprod.model.Flag = function(game, map, id, team, xTile, yTile) {
  /**
   * @type {!dotprod.model.player.LocalPlayer}
   * @private
   */
  this.localPlayer_ = game.getPlayerIndex().getLocalPlayer();

  /**
   * @type {!dotprod.model.Map}
   * @private
   */
  this.map_ = map;

  /**
   * @type {number}
   * @private
   */
  this.id_ = id;

  /**
   * @type {number}
   * @private
   */
  this.team_ = team;

  /**
   * @type {number}
   * @private
   */
  this.xTile_ = xTile;

  /**
   * @type {number}
   * @private
   */
  this.yTile_ = yTile;

  this.map_.setTile(xTile, yTile, this.getTileType_());
};

/**
 * @return {number}
 */
dotprod.model.Flag.prototype.getId = function() {
  return this.id_;
};

/**
 * @return {number}
 */
dotprod.model.Flag.prototype.getX = function() {
  return this.xTile_;
};

/**
 * @return {number}
 */
dotprod.model.Flag.prototype.getY = function() {
  return this.yTile_;
};

/**
 * @param {number} team
 * @return {boolean} true if flag ownership changed, false otherwise
 */
dotprod.model.Flag.prototype.captureFlag = function(team) {
  var changedOwnership = (this.team_ != team);
  this.team_ = team;
  this.map_.setTile(this.xTile_, this.yTile_, this.getTileType_());
  return changedOwnership;
};

/**
 * @return {dotprod.TileType}
 * @private
 */
dotprod.model.Flag.prototype.getTileType_ = function() {
  return (this.localPlayer_.getTeam() == this.team_) ? dotprod.TileType.FRIEND_FLAG : dotprod.TileType.FOE_FLAG;
};
