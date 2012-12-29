/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.math.Range');

goog.require('goog.asserts');
goog.require('goog.math');

/**
 * @constructor
 * @param {number} low
 * @param {number} high
 * @param {number} increment
 */
dotprod.math.Range = function(low, high, increment) {
  goog.asserts.assert(low <= high, 'Cannot construct a range where low > high.');

  /**
   * @type {number}
   * @private
   */
  this.low_ = low;

  /**
   * @type {number}
   * @private
   */
  this.high_ = high;

  /**
   * @type {number}
   * @private
   */
  this.increment_ = increment;

  /**
   * @type {number}
   * @private
   */
  this.value_ = low;
};

/**
 * @return {!dotprod.math.Range}
 */
dotprod.math.Range.fromArray = function(array) {
  goog.asserts.assert(array.length == 3, 'Range can only be constructed from ararys of length 3.');

  return new dotprod.math.Range(array[0], array[1], array[2]);
};

/**
 * @return {boolean}
 */
dotprod.math.Range.prototype.increment = function() {
  this.value_ = Math.min(this.value_ + this.increment_, this.high_);
  return this.isHigh();
};

/**
 * @return {boolean}
 */
dotprod.math.Range.prototype.decrement = function() {
  this.value_ = Math.max(this.value_ - this.increment_, this.low_);
  return this.isLow();
};

/**
 * @return {boolean}
 */
dotprod.math.Range.prototype.isLow = function() {
  return this.value_ == this.low_;
};

/**
 * @return {boolean}
 */
dotprod.math.Range.prototype.isHigh = function() {
  return this.value_ == this.high_;
};

dotprod.math.Range.prototype.setLow = function() {
  this.value_ = this.low_;
};

dotprod.math.Range.prototype.setHigh = function() {
  this.value_ = this.high_;
};

/**
 * @return {number}
 */
dotprod.math.Range.prototype.getValue = function() {
  return this.value_;
};

/**
 * @param {number} value
 */
dotprod.math.Range.prototype.setValue = function(value) {
  this.value_ = goog.math.clamp(value, this.low_, this.high_);
};
