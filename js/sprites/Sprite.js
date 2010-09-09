/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.Sprite');

/**
 * @constructor
 */
dotprod.sprites.Sprite = function() {
  /**
   * @type {number}
   * @protected
   */
  this.x_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.y_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.xRadius_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.yRadius_ = 0;
};

/**
 * return {!Object}
 */
dotprod.sprites.Sprite.prototype.getDimensions = function() {
  return {
    x: this.x_,
    y: this.y_,
    left: this.x_ - this.xRadius_,
    right: this.x_ + this.xRadius_,
    top: this.y_ - this.yRadius_,
    bottom: this.y_ + this.yRadius_,
    width: this.xRadius_ * 2,
    height: this.yRadius_ * 2,
    xRadius: this.xRadius_,
    yRadius: this.yRadius_
  };
};
