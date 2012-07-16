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
   * @type {!Array.<{player : dotprod.Player, message : string}>}
   * @private
   */
  this.messages_ = [];
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.ChatMessages.MAX_MESSAGES_ = 8;

/**
 * @return {number}
 */
dotprod.ChatMessages.prototype.count = function() {
  return this.messages_.length;
};

/**
 * @param {dotprod.Player} player
 * @param {string} message
 */
dotprod.ChatMessages.prototype.addMessage = function(player, message) {
  var item = { player: player, message: message };
  this.messages_.unshift(item);
  if (this.messages_.length >= dotprod.ChatMessages.MAX_MESSAGES_) {
    this.messages_ = this.messages_.slice(0, dotprod.ChatMessages.MAX_MESSAGES_ - 1);
  }
};

/**
 * @param {function({player: dotprod.Player, message : string})} callback
 */
dotprod.ChatMessages.prototype.forEach = function(callback) {
  for (var i = 0; i < this.messages_.length; ++i) {
    callback(this.messages_[i]);
  }
};
