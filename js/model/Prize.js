/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.Prize');
goog.provide('dotprod.model.Prize.Type');

goog.require('dotprod.model.ModelObject');

/**
 * @constructor
 * @extends {dotprod.model.ModelObject}
 * @param {!dotprod.model.Simulation} simulation
 * @param {!dotprod.model.Map} map
 * @param {!dotprod.model.Prize.Type} type
 * @param {number} xTile
 * @param {number} yTile
 * @param {number} ttl
 */
dotprod.model.Prize = function(simulation, map, type, xTile, yTile, ttl) {
  goog.base(this, simulation);

  this.map_ = map;
  this.type_ = type;
  this.xTile_ = xTile;
  this.yTile_ = yTile;
  this.ttl_ = ttl;

  this.map_.setTile(xTile, yTile, 255);
};
goog.inherits(dotprod.model.Prize, dotprod.model.ModelObject);

/**
 * @enum {number}
 */
dotprod.model.Prize.Type = {
  NONE: 0,
  GUN_UPGRADE: 1,
  BOMB_UPGRADE: 2,
  FULL_ENERGY: 3,
  BOUNCING_BULLETS: 4
};

dotprod.model.Prize.NUM_PRIZE_TYPES = 5;

/**
 * @return {dotprod.model.Prize.Type}
 */
dotprod.model.Prize.prototype.getType = function() {
  return this.type_;
};

/**
 * @return {number}
 */
dotprod.model.Prize.prototype.getX = function() {
  return this.xTile_;
};

/**
 * @return {number}
 */
dotprod.model.Prize.prototype.getY = function() {
  return this.yTile_;
};

/**
 * @param {number=} opt_fastForwardTicks
 * @override
 */
dotprod.model.Prize.prototype.advanceTime = function(opt_fastForwardTicks) {
  var ticks = (opt_fastForwardTicks === undefined) ? 1 : opt_fastForwardTicks;
  this.ttl_ = Math.max(0, this.ttl_ - ticks);
  if (this.ttl_ == 0) {
    this.invalidate();
  }
};

/**
 * @override
 */
dotprod.model.Prize.prototype.onInvalidate_ = function() {
  this.map_.setTile(this.xTile_, this.yTile_, 0);
};
