/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.math.Vector');

goog.require('goog.asserts');

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 */
dotprod.math.Vector = function(x, y) {
  /**
   * @type {number}
   * @private
   * @const
   */
  this.x_ = x;

  /**
   * @type {number}
   * @private
   * @const
   */
  this.y_ = y;
};

/**
 * @param {!Array.<number>} array An array of 2 elements containing the x and y values.
 * @return {!dotprod.math.Vector}
 */
dotprod.math.Vector.fromArray = function(array) {
  goog.asserts.assert(array.length == 2, 'Cannot call toArray with array of length ' + array.length);
  return new dotprod.math.Vector(array[0], array[1]);
};

/**
 * @param {number} r The magnitude of the vector. Must be a nonnegative number.
 * @param {number} theta The angle, in radians, of the vector.
 * @return {!dotprod.math.Vector}
 */
dotprod.math.Vector.fromPolar = function(r, theta) {
  return new dotprod.math.Vector(r * Math.sin(theta), -r * Math.cos(theta));
};

/**
 * @return {number}
 */
dotprod.math.Vector.prototype.getX = function() {
  return this.x_;
};

/**
 * @return {number}
 */
dotprod.math.Vector.prototype.getY = function() {
  return this.y_;
};

/**
 * @return {number}
 */
dotprod.math.Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x_ * this.x_ + this.y_ * this.y_);
};

/**
 * @return {!dotprod.math.Vector}
 */
dotprod.math.Vector.prototype.getXComponent = function() {
  return new dotprod.math.Vector(this.x_, 0);
};

/**
 * @return {!dotprod.math.Vector}
 */
dotprod.math.Vector.prototype.getYComponent = function() {
  return new dotprod.math.Vector(0, this.y_);
};

/**
 * @param {!dotprod.math.Vector} vector The second operand of the add operation.
 * @return {!dotprod.math.Vector}
 */
dotprod.math.Vector.prototype.add = function(vector) {
  return new dotprod.math.Vector(this.x_ + vector.x_, this.y_ + vector.y_);
};

/**
 * @param {!dotprod.math.Vector} vector The vector to subtract from this vector.
 * @return {!dotprod.math.Vector}
 */
dotprod.math.Vector.prototype.subtract = function(vector) {
  return new dotprod.math.Vector(this.x_ - vector.x_, this.y_ - vector.y_);
};

/**
 * @param {number} factor The coefficient by which to scale this vector.
 * @return {!dotprod.math.Vector}
 */
dotprod.math.Vector.prototype.scale = function(factor) {
  return new dotprod.math.Vector(this.x_ * factor, this.y_ * factor);
};

/**
 * @param {number} angle The angle, in radians, by which to rotate this vector.
 * @return {!dotprod.math.Vector}
 */
dotprod.math.Vector.prototype.rotate = function(angle) {
  var x = -Math.sin(angle) * (this.x_ + this.y_);
  var y = -Math.cos(angle) * (this.x_ - this.y_);

  return new dotprod.math.Vector(x, y);
};

/**
 * @param {number} newMagnitude The desired length of the vector.
 * @return {!dotprod.math.Vector}
 */
dotprod.math.Vector.prototype.resize = function(newMagnitude) {
  var currentMagnitude = this.magnitude();
  goog.asserts.assert(currentMagnitude != 0, 'Cannot resize a zero-vector.');

  return new dotprod.math.Vector(this.x_ * newMagnitude / currentMagnitude, this.y_ * newMagnitude / currentMagnitude);
};

dotprod.math.Vector.prototype.toString = function() {
  return "[" + this.x_ + ", " + this.y_ + "]";
};
