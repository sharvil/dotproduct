/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.input.Keyboard');

goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');

/**
 * @constructor
 */
dotprod.input.Keyboard = function() {
  /**
   * @type {!Object.<number, boolean>}
   * @private
   */
  this.keys_ = {};

  goog.events.listen(window, goog.events.EventType.KEYDOWN, goog.bind(this.keyPressed_, this));
  goog.events.listen(window, goog.events.EventType.KEYUP, goog.bind(this.keyReleased_, this));
};

/**
 * @param {!goog.events.KeyCodes} keyCode
 * @return {boolean}
 */
dotprod.input.Keyboard.prototype.isKeyPressed = function(keyCode) {
  return !!this.keys_[keyCode];
};

/**
 * @param {!Event} e
 * @private
 */
dotprod.input.Keyboard.prototype.keyPressed_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.LEFT || e.keyCode == goog.events.KeyCodes.RIGHT ||
      e.keyCode == goog.events.KeyCodes.UP   || e.keyCode == goog.events.KeyCodes.DOWN ||
      e.keyCode == goog.events.KeyCodes.TAB) {
    e.preventDefault();
  }
  this.keys_[e.keyCode] = true;
};

/**
 * @param {Event} e
 * @private
 */
dotprod.input.Keyboard.prototype.keyReleased_ = function(e) {
  this.keys_[e.keyCode] = false;
};
