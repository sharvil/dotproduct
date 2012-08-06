/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */
 
goog.provide('dotprod.Notifications');

goog.require('goog.array');

/**
 * @constructor
 */
dotprod.Notifications = function() {
  /**
   * @type {!Array.<Object>}
   * @private
   */
  this.messages_ = [];

  /**
   * @type {number}
   * @private
   */
  this.insertIndex_ = 0;
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.Notifications.MAX_MESSAGES_ = 5;

/**
 * @param {string} message
 */
dotprod.Notifications.prototype.addMessage = function(message) {
  this.messages_[this.insertIndex_] = {text: message, ticks: 0};
  this.insertIndex_ = (this.insertIndex_ + 1) % dotprod.Notifications.MAX_MESSAGES_;
};

/**
 * @param {function(!Object, number)} callback
 */
dotprod.Notifications.prototype.forEach = function(callback) {
  goog.array.forEach(this.messages_, callback);
};
