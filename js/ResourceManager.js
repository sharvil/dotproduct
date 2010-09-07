/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.ResourceManager');

goog.require('dotprod.TiledImage');

/**
 * @constructor
 */
dotprod.ResourceManager = function() {
  /**
   * @type {!Object.<string, !dotprod.TiledImage>}
   * @private
   */
  this.tiledImages_ = {};
};

dotprod.ResourceManager.prototype.loadTiledImage = function(name, url, xTiles, yTiles, loadCb) {
  this.tiledImages_[name] = new dotprod.TiledImage(xTiles, yTiles);
  this.tiledImages_[name].load(url, loadCb);
};

dotprod.ResourceManager.prototype.getTiledImage = function(name) {
  return this.tiledImages_[name];
};
