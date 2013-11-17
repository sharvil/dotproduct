/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.FlagIndex');

goog.require('goog.array');
goog.require('dotprod.model.Flag');

/**
 * @constructor
 * @param {!dotprod.Game} game
 */
dotprod.FlagIndex = function(game) {
  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Array.<!dotprod.model.Flag>}
   * @private
   */
  this.flags_ = [];
};

/**
 * @param {number} xTile
 * @param {number} yTile
 * @return {dotprod.model.Flag}
 */
dotprod.FlagIndex.prototype.getFlag = function(xTile, yTile) {
  return /** @type {dotprod.model.Flag} */ (goog.array.find(this.flags_, function(flag) {
    return flag.getX() == xTile && flag.getY() == yTile;
  }));
};

/**
 * @param {number} id
 * @param {number} team
 * @param {number} xTile
 * @param {number} yTile
 */
dotprod.FlagIndex.prototype.updateFlag = function(id, team, xTile, yTile) {
  var flag = this.getFlag(xTile, yTile);
  if (!flag) {
    this.flags_.push(new dotprod.model.Flag(this.game_, this.game_.getMap(), id, team, xTile, yTile));
  } else {
    flag.captureFlag(team);
  }
};
