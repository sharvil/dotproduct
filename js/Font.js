/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('Font');

/**
 * @constructor
 * @param {string} name
 * @param {number} height
 * @param {number} lineHeight
 */
Font = function(name, height, lineHeight) {
  /**
   * @type {string}
   * @private
   */
  this.name_ = name;

  /**
   * @type {number}
   * @private
   */
  this.height_ = height;

  /**
   * @type {number}
   * @private
   */
  this.lineHeight_ = lineHeight;
};

/**
 * @return {number}
 */
Font.prototype.getHeight = function() {
  return this.height_;
};

/**
 * @return {number}
 */
Font.prototype.getLineHeight = function() {
  return this.lineHeight_;
};

Font.prototype.toString = function() {
  return '' + this.height_ + 'px/' + this.lineHeight_ + 'px ' + this.name_;
};

/**
 * @const
 * @type {!Font}
 * @private
 */
Font.DEFAULT_TINY_FONT_ = new Font('Subspace Tiny', 8, 10);

/**
 * @const
 * @type {!Font}
 * @private
 */
Font.DEFAULT_SMALL_FONT_ = new Font('Subspace Small', 8, 10);

/**
 * @const
 * @type {!Font}
 * @private
 */
Font.DEFAULT_REGULAR_FONT_ = new Font('Subspace Regular', 12, 15);

/**
 * @const
 * @type {!Font}
 * @private
 */
Font.DEFAULT_LARGE_FONT_ = new Font('Subspace Large', 18, 20);

/**
 * @const
 * @type {!Font}
 * @private
 */
Font.DEFAULT_HUGE_FONT_ = new Font('Subspace Huge', 24, 30);

/**
 * @return {!Font}
 */
Font.playerFont = function() {
  return Font.DEFAULT_REGULAR_FONT_;
};

/**
 * @return {!Font}
 */
Font.scoreboardFont = function() {
  return Font.DEFAULT_REGULAR_FONT_;
};

/**
 * @return {!Font}
 */
Font.chatFont = function() {
  return Font.DEFAULT_REGULAR_FONT_;
};

/**
 * @return {!Font}
 */
Font.notificationsFont = function() {
  return Font.DEFAULT_REGULAR_FONT_;
};
