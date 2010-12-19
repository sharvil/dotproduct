/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */
 
goog.provide('dotprod.ChatMessages');

/**
 * @constructor
 */
dotprod.ChatMessages = function() {
  /**
   * @type {!Array.<string>}
   * @private
   */
  this.messages_ = [];
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.ChatMessages.MAX_MESSAGES = 8;

dotprod.ChatMessages.prototype.addMessage = function(message) {
  this.messages_.unshift(message);
  if (this.messages_.length >= dotprod.ChatMessages.MAX_MESSAGES) {
    this.messages_ = this.messages_.slice(0, dotprod.ChatMessages.MAX_MESSAGES - 1);
  }
};

/**
 * @return {!Array.<string>}
 */
dotprod.ChatMessages.prototype.getMessages = function() {
  return this.messages_;
};
