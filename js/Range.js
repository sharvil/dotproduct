/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Range');

goog.require('goog.asserts');

/**
 * @constructor
 * @param {number} low
 * @param {number} high
 * @param {number} increment
 */
dotprod.Range = function(low, high, increment) {
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
 * @return {!dotprod.Range}
 */
dotprod.Range.fromArray = function(array) {
  goog.asserts.assert(array.length == 3, 'Range can only be constructed from ararys of length 3.');

  return new dotprod.Range(array[0], array[1], array[2]);
};

/**
 * @return {boolean}
 */
dotprod.Range.prototype.increment = function() {
  this.value_ = Math.min(this.value_ + this.increment_, this.high_);
  return this.isHigh();
};

/**
 * @return {boolean}
 */
dotprod.Range.prototype.decrement = function() {
  this.value_ = Math.max(this.value_ - this.increment_, this.low_);
  return this.isLow();
};

/**
 * @return {boolean}
 */
dotprod.Range.prototype.isLow = function() {
  return this.value_ == this.low_;
};

/**
 * @return {boolean}
 */
dotprod.Range.prototype.isHigh = function() {
  return this.value_ == this.high_;
};

dotprod.Range.prototype.setLow = function() {
  this.value_ = this.low_;
};

dotprod.Range.prototype.setHigh = function() {
  this.value_ = this.high_;
};

/**
 * @return {number}
 */
dotprod.Range.prototype.getValue = function() {
  return this.value_;
};

/**
 * @param {number} value
 */
dotprod.Range.prototype.setValue = function(value) {
  this.value_ = Math.min(Math.max(this.low_, value), this.high_);
};
