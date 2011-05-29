/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Rect');

/**
 * @constructor
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 */
dotprod.Rect = function(x, y, width, height) {
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
dotprod.Rect.fromBox = function(left, top, right, bottom) {
  return new dotprod.Rect(left, top, right - left, bottom - top);
};

/**
 * @return {number}
 */
dotprod.Rect.prototype.x = function() {
  return this.x_;
};

/**
 * @return {number}
 */
dotprod.Rect.prototype.y = function() {
  return this.y_;
};

/**
 * @return {number}
 */
dotprod.Rect.prototype.width = function() {
  return this.width_;
};

/**
 * @return {number}
 */
dotprod.Rect.prototype.height = function() {
  return this.height_;
};

/**
 * @return {number}
 */
dotprod.Rect.prototype.left = function() {
  return this.x_;
};

/**
 * @return {number}
 */
dotprod.Rect.prototype.right = function() {
  return this.x_ + this.width_;
};

/**
 * @return {number}
 */
dotprod.Rect.prototype.top = function() {
  return this.y_;
};

/**
 * @return {number}
 */
dotprod.Rect.prototype.bottom = function() {
  return this.y_ + this.height_;
};
