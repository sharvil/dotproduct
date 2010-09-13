/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Entity');

goog.require('dotprod.Vector');

/**
 * @constructor
 */
dotprod.entities.Entity = function() {
  /**
   * @type {!dotprod.Vector}
   * @protected
   */
  this.position_ = new dotprod.Vector(0, 0);

  /**
   * @type {!dotprod.Vector}
   * @protected
   */
  this.velocity_ = new dotprod.Vector(0, 0);

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
dotprod.entities.Entity.prototype.getDimensions = function() {
  var x = this.position_.getX();
  var y = this.position_.getY();

  return {
    x: x,
    y: y,
    left: x - this.xRadius_,
    right: x + this.xRadius_,
    top: y - this.yRadius_,
    bottom: y + this.yRadius_,
    width: this.xRadius_ * 2,
    height: this.yRadius_ * 2,
    xRadius: this.xRadius_,
    yRadius: this.yRadius_
  };
};
