goog.provide('graphics.Animation');

goog.require('goog.asserts');
goog.require('graphics.Image');

/**
 * @constructor
 * @param {!graphics.Image} image
 * @param {number} startFrame
 * @param {number} frameCount
 * @param {number} period
 */
graphics.Animation = function(image, startFrame, frameCount, period) {
  goog.asserts.assert(startFrame < image.getNumTiles(), 'Invalid starting frame for animation.');
  goog.asserts.assert(startFrame + frameCount <= image.getNumTiles(), 'Animation length out of bounds.');

  /**
   * @type {!graphics.Image}
   * @private
   */
  this.image_ = image;

  /**
   * @type {number}
   * @private
   */
  this.begin_ = startFrame;

  /**
   * @type {number}
   * @private
   */
  this.end_ = startFrame + frameCount;

  /**
   * @type {number}
   * @private
   */
  this.currentFrame_ = startFrame;

  /**
   * @type {number}
   * @private
   */
  this.repeatCount_ = 0;

  /**
   * @type {number}
   * @private
   */
  this.period_ = period;

  /**
   * @type {number}
   * @private
   */
  this.counter_ = this.period_;
};

/**
 * @param {number} repeatCount
 */
graphics.Animation.prototype.setRepeatCount = function(repeatCount) {
  this.repeatCount_ = repeatCount;
};

/**
 * @return {boolean}
 */
graphics.Animation.prototype.isRunning = function() {
  return this.currentFrame_ < this.end_;
};

/**
 * @return {number}
 */
graphics.Animation.prototype.getWidth = function() {
  return this.image_.getTileWidth();
};

/**
 * @return {number}
 */
graphics.Animation.prototype.getHeight = function() {
  return this.image_.getTileHeight();
};

graphics.Animation.prototype.update = function() {
  if (this.isRunning()) {
    if (!--this.counter_) {
      ++this.currentFrame_;
      this.counter_ = this.period_;
    }
  }

  if (!this.isRunning() && this.repeatCount_) {
    this.currentFrame_ = this.begin_;
    --this.repeatCount_;
  }
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {number} x
 * @param {number} y
 */
graphics.Animation.prototype.render = function(context, x, y) {
  if (this.isRunning()) {
    this.image_.render(context, x, y, this.currentFrame_);
  }
};
