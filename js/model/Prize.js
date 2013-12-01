/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('model.Prize');

goog.require('model.ModelObject');
goog.require('PrizeType');
goog.require('TileType');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @param {!model.Simulation} simulation
 * @param {!model.Map} map
 * @param {!PrizeType} type
 * @param {number} xTile
 * @param {number} yTile
 * @param {number} ttl
 */
model.Prize = function(simulation, map, type, xTile, yTile, ttl) {
  goog.base(this, simulation);

  this.map_ = map;
  this.type_ = type;
  this.xTile_ = xTile;
  this.yTile_ = yTile;
  this.ttl_ = ttl;

  this.map_.setTile(xTile, yTile, TileType.PRIZE);
};
goog.inherits(model.Prize, model.ModelObject);

/**
 * @return {PrizeType}
 */
model.Prize.prototype.getType = function() {
  return this.type_;
};

/**
 * @return {number}
 */
model.Prize.prototype.getX = function() {
  return this.xTile_;
};

/**
 * @return {number}
 */
model.Prize.prototype.getY = function() {
  return this.yTile_;
};

/**
 * @param {number=} opt_fastForwardTicks
 * @override
 */
model.Prize.prototype.advanceTime = function(opt_fastForwardTicks) {
  var ticks = (opt_fastForwardTicks === undefined) ? 1 : opt_fastForwardTicks;
  this.ttl_ = Math.max(0, this.ttl_ - ticks);
  if (this.ttl_ == 0) {
    this.invalidate();
  }
};

/**
 * @override
 */
model.Prize.prototype.onInvalidate_ = function() {
  this.map_.setTile(this.xTile_, this.yTile_, 0);
};
