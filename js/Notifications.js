/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */
 
goog.provide('Notifications');
goog.provide('Notifications.Type');

goog.require('goog.array');

goog.require('html5.Notifications');

goog.require('model.player.Player.Presence');

/**
 * @constructor
 * @param {!model.player.LocalPlayer} localPlayer
 */
Notifications = function(localPlayer) {
  /**
   * @type {!model.player.LocalPlayer}
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
Notifications.Type = {
  DEFAULT: 1,
  PERSONAL: 2,
  ENTER: 3
};

/**
 * @type {number}
 * @private
 * @const
 */
Notifications.MAX_MESSAGES_ = 5;

/**
 * @param {string} message
 */
Notifications.prototype.addMessage = function(message) {
  this.addMessage_(Notifications.Type.DEFAULT, message);
};

/**
 * @param {string} message
 */
Notifications.prototype.addPersonalMessage = function(message) {
  this.addMessage_(Notifications.Type.PERSONAL, message);
};

/**
 * @param {string} message
 */
Notifications.prototype.addEnterMessage = function(message) {
  this.addMessage_(Notifications.Type.ENTER, message);
};

/**
 * @param {Notifications.Type} type
 * @param {string} message
 * @private
 */
Notifications.prototype.addMessage_ = function(type, message) {
  this.messages_[this.insertIndex_] = {
    type: type,
    text: message,
    ticks: 0
  };

  this.insertIndex_ = (this.insertIndex_ + 1) % Notifications.MAX_MESSAGES_;

  // Only show desktop notifications if the user isn't focused on the game.
  if (this.localPlayer_.hasPresence(model.player.Player.Presence.AWAY)) {
    var notification = html5.Notifications.createNotification('img/dotproduct_logo_128.png', 'dotproduct', message);
    setTimeout(function() { notification.close(); }, 5000);
    notification.show();
  }
};

/**
 * @param {function(!Object, number)} callback
 */
Notifications.prototype.forEach = function(callback) {
  goog.array.forEach(this.messages_, callback);
};
