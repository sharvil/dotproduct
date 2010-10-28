/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.ResourceManager');

goog.require('goog.debug.Logger');
goog.require('dotprod.Image');
goog.require('dotprod.VideoEnsemble');

/**
 * @constructor
 */
dotprod.ResourceManager = function() {
  /**
   * @type {!goog.logger.Logger}
   * @private
   */
  this.logger_ = goog.debug.Logger.getLogger('dotprod.ResourceManager');

  /**
   * @type {!Object.<string, !dotprod.Image>}
   * @private
   */
  this.images_ = {};

  /**
   * @type {!Object.<string, !dotprod.VideoEnsemble>}
   * @private
   */
  this.videoEnsembles_ = {};

  /**
   * @type {!Object.<string, Audio>}
   * @private
   */
  this.sounds_ = {};
};

/**
 * @param {string} name
 * @param {string} url
 * @param {number} xTiles
 * @param {number} yTiles
 * @param {function()} loadCb
 */
dotprod.ResourceManager.prototype.loadImage = function(name, url, xTiles, yTiles, loadCb) {
  var self = this;
  var callback = function() {
    self.logger_.info('Loaded image: "' + name + '"');
    loadCb();
  };

  this.logger_.info('Loading image: "' + name + '" using URL: ' + url);
  this.images_[name] = new dotprod.Image(xTiles, yTiles);
  this.images_[name].load(url, callback);
};

/**
 * @param {string} name
 * @param {string} url
 * @param {number} xTiles
 * @param {number} yTiles
 * @param {number} frames
 * @param {number} period
 * @param {function()} loadCb
 */
dotprod.ResourceManager.prototype.loadVideoEnsemble = function(name, url, xTiles, yTiles, frames, period, loadCb) {
  var self = this;
  var callback = function() {
    self.logger_.info('Loaded video ensemble: "' + name + '"');
    loadCb();
  };

  this.logger_.info('Loading video ensemble: "' + name + '" using URL: ' + url);
  this.videoEnsembles_[name] = new dotprod.VideoEnsemble(xTiles, yTiles, frames, period);
  this.videoEnsembles_[name].load(url, callback)
}

dotprod.ResourceManager.prototype.loadSound = function(name, url, loadCb) {
  // TODO(sharvil): remove this once Chrome and Safari behave correctly when loading Audio.
  loadCb();
  return;

  var self = this;
  var callback = function() {
    self.logger_.info('Loaded sound: "' + name + '"');
    loadCb();
  };

  this.logger_.info('Loading sound: "' + name + '" using URL: ' + url);
  this.sounds_[name] = new Audio();
  this.sounds_[name].src = url;
  this.sounds_[name].addEventListener('error', callback);
  this.sounds_[name].addEventListener('progress', callback);
  this.sounds_[name].load();
};

dotprod.ResourceManager.prototype.playSound = function(name) {
  // TODO(sharvil): remove this check -- we should always have an Audio object
  // whenever we try to play it. We do this for now since Chrome and Safari's
  // audio loading code seems to be broken.
  if (name in this.sounds_) {
    this.sounds_[name].play();
  }
};

/**
 * @param {string} name
 * @return {(!dotprod.Image|undefined)}
 */
dotprod.ResourceManager.prototype.getImage = function(name) {
  return this.images_[name];
};

/**
 * @param {string} name
 * @return {(!dotprod.VideoEnsemble|undefined)}
 */
dotprod.ResourceManager.prototype.getVideoEnsemble = function(name) {
  return this.videoEnsembles_[name];
};
