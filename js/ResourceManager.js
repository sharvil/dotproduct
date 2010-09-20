/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.ResourceManager');

goog.require('dotprod.Image');

/**
 * @constructor
 */
dotprod.ResourceManager = function() {
  /**
   * @type {!Object.<string, !dotprod.Image>}
   * @private
   */
  this.images_ = {};

  /**
   * @type {!Object.<string, Audio>}
   * @private
   */
  this.sounds_ = {};
};

dotprod.ResourceManager.prototype.loadImage = function(name, url, xTiles, yTiles, loadCb) {
  this.images_[name] = new dotprod.Image(xTiles, yTiles);
  this.images_[name].load(url, loadCb);
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

dotprod.ResourceManager.prototype.getImage = function(name) {
  return this.images_[name];
};
