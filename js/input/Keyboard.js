goog.provide('input.Keyboard');

goog.require('goog.events');
goog.require('goog.events.EventHandler');
goog.require('goog.events.EventTarget');
goog.require('goog.events.EventType');
goog.require('goog.events.KeyCodes');

/**
 * @constructor
 */
input.Keyboard = function() {
  /**
   * @type {!Object.<number, boolean>}
   * @private
   */
  this.keys_ = {};

  goog.events.listen(document, this.getVisibilityEvent_(), this.documentVisibilityChanged_.bind(this));
  goog.events.listen(window, goog.events.EventType.KEYDOWN, this.keyPressed_.bind(this));
  goog.events.listen(window, goog.events.EventType.KEYUP, this.keyReleased_.bind(this));
};

/**
 * @param {!goog.events.KeyCodes} keyCode
 * @return {boolean}
 */
input.Keyboard.prototype.isKeyPressed = function(keyCode) {
  return !!this.keys_[keyCode];
};

/**
 * @param {!Event} e
 * @private
 */
input.Keyboard.prototype.keyPressed_ = function(e) {
  if (e.keyCode == goog.events.KeyCodes.LEFT || e.keyCode == goog.events.KeyCodes.RIGHT ||
      e.keyCode == goog.events.KeyCodes.UP   || e.keyCode == goog.events.KeyCodes.DOWN ||
      e.keyCode == goog.events.KeyCodes.TAB  || e.keyCode == goog.events.KeyCodes.BACKSPACE) {
    e.preventDefault();
  }
  this.keys_[e.keyCode] = true;
};

/**
 * @param {Event} e
 * @private
 */
input.Keyboard.prototype.keyReleased_ = function(e) {
  this.keys_[e.keyCode] = false;
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
input.Keyboard.prototype.documentVisibilityChanged_ = function(event) {
  if (document[this.getVisibilityProperty_()]) {
    for (var i in this.keys_) {
      this.keys_[i] = false;
    }
  }
};

/**
 * @return {string}
 * @private
 */
input.Keyboard.prototype.getVisibilityProperty_ = function() {
  if (typeof document.hidden !== 'undefined') {
    return 'hidden';
  }
  if (typeof document.mozHidden !== 'undefined') {
    return 'mozHidden';
  }
  if (typeof document.msHidden !== 'undefined') {
    return 'msHidden';
  }
  if (typeof document.webkitHidden !== 'undefined') {
    return 'webkitHidden';
  }
  return '';
};

/**
 * @return {string}
 * @private
 */
input.Keyboard.prototype.getVisibilityEvent_ = function() {
  if (typeof document.hidden !== 'undefined') {
    return 'visibilitychange';
  }
  if (typeof document.mozHidden !== 'undefined') {
    return 'mozvisibilitychange';
  }
  if (typeof document.msHidden !== 'undefined') {
    return 'msvisibilitychange';
  }
  if (typeof document.webkitHidden !== 'undefined') {
    return 'webkitvisibilitychange';
  }
  return '';
};
