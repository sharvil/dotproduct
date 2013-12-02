goog.provide('FlagIndex');

goog.require('goog.array');
goog.require('model.Flag');

/**
 * @constructor
 * @param {!Game} game
 */
FlagIndex = function(game) {
  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Array.<!model.Flag>}
   * @private
   */
  this.flags_ = [];
};

/**
 * @param {number} xTile
 * @param {number} yTile
 * @return {model.Flag}
 */
FlagIndex.prototype.getFlag = function(xTile, yTile) {
  return /** @type {model.Flag} */ (goog.array.find(this.flags_, function(flag) {
    return flag.getX() == xTile && flag.getY() == yTile;
  }));
};

/**
 * @param {number} id
 * @param {number} team
 * @param {number} xTile
 * @param {number} yTile
 */
FlagIndex.prototype.updateFlag = function(id, team, xTile, yTile) {
  var flag = this.getFlag(xTile, yTile);
  if (!flag) {
    this.flags_.push(new model.Flag(this.game_, this.game_.getMap(), id, team, xTile, yTile));
  } else {
    flag.captureFlag(team);
  }
};
