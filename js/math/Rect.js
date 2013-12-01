/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('math.Rect');

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
math.Rect = function(x, y, width, height) {
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
math.Rect.fromBox = function(left, top, right, bottom) {
  return new math.Rect(left, top, right - left, bottom - top);
};

/**
 * @return {number}
 */
math.Rect.prototype.x = function() {
  return this.x_;
};

/**
 * @return {number}
 */
math.Rect.prototype.y = function() {
  return this.y_;
};

/**
 * @return {number}
 */
math.Rect.prototype.width = function() {
  return this.width_;
};

/**
 * @return {number}
 */
math.Rect.prototype.height = function() {
  return this.height_;
};

/**
 * @return {number}
 */
math.Rect.prototype.left = function() {
  return this.x_;
};

/**
 * @return {number}
 */
math.Rect.prototype.right = function() {
  return this.x_ + this.width_;
};

/**
 * @return {number}
 */
math.Rect.prototype.top = function() {
  return this.y_;
};

/**
 * @return {number}
 */
math.Rect.prototype.bottom = function() {
  return this.y_ + this.height_;
};

/**
 * @param {!math.Vector} vec
 * @return {boolean}
 */
math.Rect.prototype.contains = function(vec) {
  var x = vec.getX();
  var y = vec.getY();
  return x >= this.x_ && x <= this.x_ + this.width_ && y >= this.y_ && y <= this.y_ + this.height_;
};
