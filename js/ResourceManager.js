goog.provide('ResourceManager');

goog.require('goog.asserts');
goog.require('goog.debug.Logger');
goog.require('graphics.Image');
goog.require('graphics.SpriteSheet');

/**
 * @constructor
 */
ResourceManager = function() {
  /**
   * @type {!goog.debug.Logger}
   * @private
   */
  this.logger_ = goog.debug.Logger.getLogger('ResourceManager');

  /**
   * @type {!Object.<string, !graphics.Image>}
   * @private
   */
  this.images_ = {};

  /**
   * @type {!Object.<string, !graphics.SpriteSheet>}
   * @private
   */
  this.spriteSheets_ = {};

  /**
   * @type {!Object.<string, HTMLAudioElement>}
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
ResourceManager.prototype.loadImage = function(name, url, xTiles, yTiles, loadCb) {
  var self = this;
  var callback = function() {
    self.logger_.info('Loaded image: "' + name + '"');
    loadCb();
  };

  this.logger_.info('Loading image: "' + name + '" using URL: ' + url);
  this.images_[name] = new graphics.Image(xTiles, yTiles);
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
ResourceManager.prototype.loadSpriteSheet = function(name, url, xTiles, yTiles, frames, period, loadCb) {
  var self = this;
  var callback = function() {
    self.logger_.info('Loaded video ensemble: "' + name + '"');
    loadCb();
  };

  this.logger_.info('Loading video ensemble: "' + name + '" using URL: ' + url);
  this.spriteSheets_[name] = new graphics.SpriteSheet(xTiles, yTiles, frames, period);
  this.spriteSheets_[name].load(url, callback)
}

/**
 * @param {string} name
 * @param {string} url
 * @param {function()} loadCb
 */
ResourceManager.prototype.loadSound = function(name, url, loadCb) {
  // TODO(sharvil): remove this once Chrome and Safari behave correctly when loading Audio.
  loadCb();
  return;
/*
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
*/
};

/**
 * @param {string} name
 */
ResourceManager.prototype.playSound = function(name) {
  // TODO(sharvil): remove this check -- we should always have an Audio object
  // whenever we try to play it. We do this for now since Chrome and Safari's
  // audio loading code seems to be broken.
  if (name in this.sounds_) {
    this.sounds_[name].play();
  }
};

/**
 * @param {string} name
 * @return {!graphics.Image}
 */
ResourceManager.prototype.getImage = function(name) {
  goog.asserts.assert(this.images_[name], 'Requesting missing image resource: ' + name);
  return this.images_[name];
};

/**
 * @param {string} name
 * @return {!graphics.SpriteSheet}
 */
ResourceManager.prototype.getSpriteSheet = function(name) {
  goog.asserts.assert(this.spriteSheets_[name], 'Requesting missing video ensemble: ' + name);
  return this.spriteSheets_[name];
};
