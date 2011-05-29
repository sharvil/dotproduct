/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Prize');

/**
 * @contstructor
 * @param {!dotprod.Prize.Type} type
 * @param {number} xTile
 * @param {number} yTile
 */
dotprod.Prize = function(type, xTile, yTile) {
  this.type_ = type;
  this.xTile_ = xTile;
  this.yTile_ = yTile;
};

dotprod.Prize.Type = {
  NONE: 0,
  GUN_UPGRADE: 1,
  BOMB_UPGRADE: 2,
  FULL_ENERGY: 3
};
