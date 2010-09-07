/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Map');

/**
 * @constructor
 * @param {!Object.<number, number>} mapData
 * @param {number} width
 * @param {number} height
 */
dotprod.Map = function(mapData, width, height) {
  /**
   * @type {!Object.<number, number>}
   * @private
   */
   this.mapData_ = mapData;

   /**
    * @type {number}
    * @private
    */
   this.width_ = width;

   /**
    * @type {number}
    * @private
    */
   this.height_ = height;
};

/**
 * @return {number}
 */
dotprod.Map.prototype.getWidth = function() {
  return this.width_;
};

/**
 * @return {number}
 */
dotprod.Map.prototype.getHeight = function() {
  return this.height_;
};

/**
 * @param {number} x X-coordinate in tile units.
 * @param {number} y Y-coordinate in tile units.
 * @return {number}
 */
dotprod.Map.prototype.getTile = function(x, y) {
  var index = x + y * this.width_;
  return this.mapData_[index] ? this.mapData_[index] : 0;
};
