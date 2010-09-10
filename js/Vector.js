/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Vector');

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
dotprod.Vector.prototype.add = function(vector) {
  return new dotprod.Vector(this.x_ + vector.x_, this.y_ + vector.y_);
};

/**
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.subtract = function(vector) {
  return new dotprod.Vector(this.x_ - vector.x_, this.y_ - vector.y_);
};

/**
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.scale = function(factor) {
  return new dotprod.Vector(this.x_ * factor, this.y_ * factor);
};

/**
 * @return {!dotprod.Vector}
 */
dotprod.Vector.prototype.rotate = function(angle) {
  var x = -Math.sin(angle) * (this.x_ + this.y_);
  var y = -Math.cos(angle) * (this.x_ - this.y_);

  return new dotprod.Vector(x, y);
};
