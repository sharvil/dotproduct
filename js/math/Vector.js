goog.provide('math.Vector');

goog.require('goog.asserts');

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 */
math.Vector = function(x, y) {
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
 * @type {!math.Vector}
 * @const
 */
math.Vector.ZERO = new math.Vector(0, 0);

/**
 * @param {!Array.<number>} array An array of 2 elements containing the x and y values.
 * @return {!math.Vector}
 */
math.Vector.fromArray = function(array) {
  goog.asserts.assert(array.length == 2, 'Cannot call toArray with array of length ' + array.length);
  return new math.Vector(array[0], array[1]);
};

/**
 * @param {number} r The magnitude of the vector. Must be a nonnegative number.
 * @param {number} theta The angle, in radians, of the vector.
 * @return {!math.Vector}
 */
math.Vector.fromPolar = function(r, theta) {
  return new math.Vector(r * Math.sin(theta), -r * Math.cos(theta));
};

/**
 * @return {number}
 */
math.Vector.prototype.getX = function() {
  return this.x_;
};

/**
 * @return {number}
 */
math.Vector.prototype.getY = function() {
  return this.y_;
};

/**
 * @return {number}
 */
math.Vector.prototype.magnitude = function() {
  return Math.sqrt(this.x_ * this.x_ + this.y_ * this.y_);
};

/**
 * @return {!math.Vector}
 */
math.Vector.prototype.getXComponent = function() {
  return new math.Vector(this.x_, 0);
};

/**
 * @return {!math.Vector}
 */
math.Vector.prototype.getYComponent = function() {
  return new math.Vector(0, this.y_);
};

/**
 * @param {!math.Vector} vector The second operand of the add operation.
 * @return {!math.Vector}
 */
math.Vector.prototype.add = function(vector) {
  return new math.Vector(this.x_ + vector.x_, this.y_ + vector.y_);
};

/**
 * @param {!math.Vector} vector The vector to subtract from this vector.
 * @return {!math.Vector}
 */
math.Vector.prototype.subtract = function(vector) {
  return new math.Vector(this.x_ - vector.x_, this.y_ - vector.y_);
};

/**
 * @param {number} factor The coefficient by which to scale this vector.
 * @return {!math.Vector}
 */
math.Vector.prototype.scale = function(factor) {
  return new math.Vector(this.x_ * factor, this.y_ * factor);
};

/**
 * @param {number} angle The angle, in radians, by which to rotate this vector.
 * @return {!math.Vector}
 */
math.Vector.prototype.rotate = function(angle) {
  var x = -Math.sin(angle) * (this.x_ + this.y_);
  var y = -Math.cos(angle) * (this.x_ - this.y_);

  return new math.Vector(x, y);
};

/**
 * @param {number} newMagnitude The desired length of the vector.
 * @return {!math.Vector}
 */
math.Vector.prototype.resize = function(newMagnitude) {
  var currentMagnitude = this.magnitude();
  goog.asserts.assert(currentMagnitude != 0, 'Cannot resize a zero-vector.');

  return new math.Vector(this.x_ * newMagnitude / currentMagnitude, this.y_ * newMagnitude / currentMagnitude);
};

/**
 * @return {!Array.<number>}
 */
math.Vector.prototype.toArray = function() {
  return [this.x_, this.y_];
};

/**
 * @return {string}
 */
math.Vector.prototype.toString = function() {
  return "[" + this.x_ + ", " + this.y_ + "]";
};
