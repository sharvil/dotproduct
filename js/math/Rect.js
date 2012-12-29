/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.math.Rect');

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
dotprod.math.Rect = function(x, y, width, height) {
  this.x_ = x;
  this.y_ = y;
  this.width_ = width;
  this.height_ = height;
};

/**
 * @param {number} left
 * @param {number} top
 * @param {number} right
 * @param {number} bottom
 */
dotprod.math.Rect.fromBox = function(left, top, right, bottom) {
  return new dotprod.math.Rect(left, top, right - left, bottom - top);
};

/**
 * @return {number}
 */
dotprod.math.Rect.prototype.x = function() {
  return this.x_;
};

/**
 * @return {number}
 */
dotprod.math.Rect.prototype.y = function() {
  return this.y_;
};

/**
 * @return {number}
 */
dotprod.math.Rect.prototype.width = function() {
  return this.width_;
};

/**
 * @return {number}
 */
dotprod.math.Rect.prototype.height = function() {
  return this.height_;
};

/**
 * @return {number}
 */
dotprod.math.Rect.prototype.left = function() {
  return this.x_;
};

/**
 * @return {number}
 */
dotprod.math.Rect.prototype.right = function() {
  return this.x_ + this.width_;
};

/**
 * @return {number}
 */
dotprod.math.Rect.prototype.top = function() {
  return this.y_;
};

/**
 * @return {number}
 */
dotprod.math.Rect.prototype.bottom = function() {
  return this.y_ + this.height_;
};

/**
 * @param {!dotprod.math.Vector} vec
 * @return {boolean}
 */
dotprod.math.Rect.prototype.contains = function(vec) {
  var x = vec.getX();
  var y = vec.getY();
  return x >= this.x_ && x <= this.x_ + this.width_ && y >= this.y_ && y <= this.y_ + this.height_;
};
