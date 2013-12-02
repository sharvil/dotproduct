goog.provide('graphics.SpriteSheet');

goog.require('goog.asserts');
goog.require('graphics.Image');

/**
 * @constructor
 * @param {number} tilesPerRow
 * @param {number} tilesPerCol
 * @param {number} framesPerAnimation
 * @param {number} period
 */
graphics.SpriteSheet = function(tilesPerRow, tilesPerCol, framesPerAnimation, period) {
  goog.asserts.assert(tilesPerRow * tilesPerCol % framesPerAnimation == 0, 'Invalid animation parameters.');

  /**
   * @type {number}
   * @private
   */
  this.numAnimations_ = tilesPerRow * tilesPerCol / framesPerAnimation;

  /**
   * @type {number}
   * @private
   */
  this.framesPerAnimation_ = framesPerAnimation;

  /**
   * @type {number}
   * @private
   */
  this.period_ = period || 1;

  /**
   * @type {!graphics.Image}
   * @private
   */
  this.image_ = new graphics.Image(tilesPerRow, tilesPerCol);
};

/**
 * @return {boolean} True if this animation has been loaded, false otherwise.
 */
graphics.SpriteSheet.prototype.isLoaded = function() {
  return this.image_.isLoaded();
};

/**
 * @param {string} resourceName
 * @param {function(string)=} opt_loadCb
 */
graphics.SpriteSheet.prototype.load = function(resourceName, opt_loadCb) {
  this.image_.load(resourceName, opt_loadCb);
};

/**
 * @return {number}
 */
graphics.SpriteSheet.prototype.getNumAnimations = function() {
  return this.numAnimations_;
};

/**
 * @param {number} index
 * @return {!graphics.Animation}
 */
graphics.SpriteSheet.prototype.getAnimation = function(index) {
  goog.asserts.assert(index >= 0, 'Negative index specified.');
  goog.asserts.assert(index < this.getNumAnimations(), 'Index out of bounds: ' + index);
  goog.asserts.assert(this.isLoaded(), 'Animation requested before loading finished.');

  return new graphics.Animation(this.image_, index * this.framesPerAnimation_, this.framesPerAnimation_, this.period_);
};
