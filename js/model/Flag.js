goog.provide('model.Flag');

goog.require('TileType');

/**
 * @constructor
 * @param {!Game} game
 * @param {!model.Map} map
 * @param {number} id
 * @param {number} team
 * @param {number} xTile
 * @param {number} yTile
 */
model.Flag = function(game, map, id, team, xTile, yTile) {
  /**
   * @type {!model.player.LocalPlayer}
   * @private
   */
  this.localPlayer_ = game.getPlayerIndex().getLocalPlayer();

  /**
   * @type {!model.Map}
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
model.Flag.prototype.getId = function() {
  return this.id_;
};

/**
 * @return {number}
 */
model.Flag.prototype.getX = function() {
  return this.xTile_;
};

/**
 * @return {number}
 */
model.Flag.prototype.getY = function() {
  return this.yTile_;
};

/**
 * @param {number} team
 * @return {boolean} true if flag ownership changed, false otherwise
 */
model.Flag.prototype.captureFlag = function(team) {
  var changedOwnership = (this.team_ != team);
  this.team_ = team;
  this.map_.setTile(this.xTile_, this.yTile_, this.getTileType_());
  return changedOwnership;
};

/**
 * @return {TileType}
 * @private
 */
model.Flag.prototype.getTileType_ = function() {
  return (this.localPlayer_.getTeam() == this.team_) ? TileType.FRIEND_FLAG : TileType.FOE_FLAG;
};
