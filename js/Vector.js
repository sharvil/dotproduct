/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Vector');

goog.require('goog.asserts');

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 */
dotprod.Vector = function(x, y) {
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
 * @param {number} r The magnitude of the vector. Must be a nonnegative number.
 * @param {number} theta The angle, in radians, of the vector.
 * @return {!dotprod.Vector}
 */
dotprod.Vector.fromPolar = function(r, theta) {
  return new dotprod.Vector(r * Math.sin(theta), -r * Math.cos(theta));
};

/**
 * @return {number}
 */
dotprod.Vector.prototype.getX = function() {
  return this.x_;
};

/**
 * @return {number}
 */
dotprod.Vector.prototype.getY = function() {
  return this.y_;
};

/**
 * @return {number}
 */
dotprod.Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x_ * this.x_ + this.y_ * this.y_);
};

/**
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.getXComponent = function() {
  return new dotprod.Vector(this.x_, 0);
};

/**
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.getYComponent = function() {
  return new dotprod.Vector(0, this.y_);
};

/**
 * @param {!dotprod.Vector} vector The second operand of the add operation.
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.add = function(vector) {
  return new dotprod.Vector(this.x_ + vector.x_, this.y_ + vector.y_);
};

/**
 * @param {!dotprod.Vector} vector The vector to subtract from this vector.
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.subtract = function(vector) {
  return new dotprod.Vector(this.x_ - vector.x_, this.y_ - vector.y_);
};

/**
 * @param {number} factor The coefficient by which to scale this vector.
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.scale = function(factor) {
  return new dotprod.Vector(this.x_ * factor, this.y_ * factor);
};

/**
 * @param {number} angle The angle, in radians, by which to rotate this vector.
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.rotate = function(angle) {
  var x = -Math.sin(angle) * (this.x_ + this.y_);
  var y = -Math.cos(angle) * (this.x_ - this.y_);

  return new dotprod.Vector(x, y);
};

/**
 * @param {number} newMagnitude The desired length of the vector.
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.resize = function(newMagnitude) {
  var currentMagnitude = this.magnitude();
  goog.asserts.assert(currentMagnitude != 0, 'Cannot resize a zero-vector.');

  return new dotprod.Vector(this.x_ * newMagnitude / currentMagnitude, this.y_ * newMagnitude / currentMagnitude);
};

dotprod.Vector.prototype.toString = function() {
  return "[" + this.x_ + ", " + this.y_ + "]";
};
