/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Prize');
goog.provide('dotprod.Prize.Type');

/**
 * @constructor
 * @param {!dotprod.Prize.Type} type
 * @param {number} xTile
 * @param {number} yTile
 * @param {number} ttl
 */
dotprod.Prize = function(type, xTile, yTile, ttl) {
  this.type_ = type;
  this.xTile_ = xTile;
  this.yTile_ = yTile;
  this.ttl_ = ttl;
};

/**
 * @enum {number}
 */
dotprod.Prize.Type = {
  NONE: 0,
  GUN_UPGRADE: 1,
  BOMB_UPGRADE: 2,
  FULL_ENERGY: 3,
  BOUNCING_BULLETS: 4
};

dotprod.Prize.NUM_PRIZE_TYPES = 5;

/**
 * @return {dotprod.Prize.Type}
 */
dotprod.Prize.prototype.getType = function() {
  return this.type_;
};

/**
 * @return {number}
 */
dotprod.Prize.prototype.getX = function() {
  return this.xTile_;
};

/**
 * @return {number}
 */
dotprod.Prize.prototype.getY = function() {
  return this.yTile_;
};

/**
 * @param {number=} opt_fastForwardTicks
 */
dotprod.Prize.prototype.update = function(opt_fastForwardTicks) {
  var ticks = (opt_fastForwardTicks === undefined) ? 1 : opt_fastForwardTicks;
  this.ttl_ = Math.max(0, this.ttl_ - ticks);
};

/**
 * @return {boolean}
 */
dotprod.Prize.prototype.isAlive = function() {
  return this.ttl_ > 0;
};
