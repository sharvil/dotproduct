goog.provide('math.Range');

goog.require('goog.asserts');
goog.require('goog.math');

/**
 * @constructor
 * @param {number} low
 * @param {number} high
 * @param {number} increment
 */
math.Range = function(low, high, increment) {
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
 * @param {!Array.<number>} array
 * @return {!math.Range}
 */
math.Range.fromArray = function(array) {
  goog.asserts.assert(array.length == 3, 'Range can only be constructed from ararys of length 3.');

  return new math.Range(array[0], array[1], array[2]);
};

/**
 * @return {boolean}
 */
math.Range.prototype.increment = function() {
  this.value_ = Math.min(this.value_ + this.increment_, this.high_);
  return this.isHigh();
};

/**
 * @return {boolean}
 */
math.Range.prototype.decrement = function() {
  this.value_ = Math.max(this.value_ - this.increment_, this.low_);
  return this.isLow();
};

/**
 * @return {boolean}
 */
math.Range.prototype.isLow = function() {
  return this.value_ == this.low_;
};

/**
 * @return {boolean}
 */
math.Range.prototype.isHigh = function() {
  return this.value_ == this.high_;
};

math.Range.prototype.setLow = function() {
  this.value_ = this.low_;
};

math.Range.prototype.setHigh = function() {
  this.value_ = this.high_;
};

/**
 * @return {number}
 */
math.Range.prototype.getValue = function() {
  return this.value_;
};

/**
 * @param {number} value
 */
math.Range.prototype.setValue = function(value) {
  this.value_ = goog.math.clamp(value, this.low_, this.high_);
};
