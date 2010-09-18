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

  /**
   * @type {!Object.<string, Audio>}
   * @private
   */
  this.sounds_ = {};
};

dotprod.ResourceManager.prototype.loadTiledImage = function(name, url, xTiles, yTiles, loadCb) {
  this.tiledImages_[name] = new dotprod.TiledImage(xTiles, yTiles);
  this.tiledImages_[name].load(url, loadCb);
};

dotprod.ResourceManager.prototype.loadSound = function(name, url, loadCb) {
  this.sounds_[name] = new Audio();
  this.sounds_[name].src = url;
  this.sounds_[name].load();
  this.sounds_[name].addEventListener('error', function() { loadCb(); });
  this.sounds_[name].addEventListener('progress', function() { loadCb(); });
};

dotprod.ResourceManager.prototype.playSound = function(name) {
  this.sounds_[name].play();
};

dotprod.ResourceManager.prototype.getTiledImage = function(name) {
  return this.tiledImages_[name];
};
