/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */
 
goog.provide('dotprod.Notifications');
goog.provide('dotprod.Notifications.Type');

goog.require('goog.array');

goog.require('html5.Notifications');

goog.require('dotprod.entities.Player.Presence');

/**
 * @constructor
 * @param {!dotprod.entities.LocalPlayer} localPlayer
 */
dotprod.Notifications = function(localPlayer) {
  /**
   * @type {!dotprod.entities.LocalPlayer}
   * @private
   */
  this.localPlayer_ = localPlayer;

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
 * @enum {number}
 */
dotprod.Notifications.Type = {
  DEFAULT: 1,
  PERSONAL: 2,
  ENTER: 3
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
  this.addMessage_(dotprod.Notifications.Type.DEFAULT, message);
};

/**
 * @param {string} message
 */
dotprod.Notifications.prototype.addPersonalMessage = function(message) {
  this.addMessage_(dotprod.Notifications.Type.PERSONAL, message);
};

/**
 * @param {string} message
 */
dotprod.Notifications.prototype.addEnterMessage = function(message) {
  this.addMessage_(dotprod.Notifications.Type.ENTER, message);
};

/**
 * @param {dotprod.Notifications.Type} type
 * @param {string} message
 * @private
 */
dotprod.Notifications.prototype.addMessage_ = function(type, message) {
  this.messages_[this.insertIndex_] = {
    type: type,
    text: message,
    ticks: 0
  };

  this.insertIndex_ = (this.insertIndex_ + 1) % dotprod.Notifications.MAX_MESSAGES_;

  // Only show desktop notifications if the user isn't focused on the game.
  if (this.localPlayer_.hasPresence(dotprod.entities.Player.Presence.AWAY)) {
    var notification = html5.Notifications.createNotification('img/dotproduct_logo_128.png', 'dotproduct', message);
    setTimeout(function() { notification.close(); }, 5000);
    notification.show();
  }
};

/**
 * @param {function(!Object, number)} callback
 */
dotprod.Notifications.prototype.forEach = function(callback) {
  goog.array.forEach(this.messages_, callback);
};
