/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */
 
goog.provide('dotprod.Notifications');

/**
 * @constructor
 */
dotprod.Notifications = function() {
  /**
   * @type {!Array.<Object>}
   * @private
   */
  this.messages_ = [];
  for (var i = 0; i < dotprod.Notifications.MAX_MESSAGES_; ++i) {
    this.messages_.push(null);
  }

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
  this.insertIndex_ = (this.insertIndex_ + 1) % this.messages_.length;
};

/**
 * @return {!Array.<Object>}
 */
dotprod.Notifications.prototype.getMessages = function() {
  return this.messages_;
};
