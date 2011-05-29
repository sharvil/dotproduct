/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.NotificationLayer');

goog.require('dotprod.Camera');
goog.require('dotprod.FontFoundry');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.Palette');
goog.require('dotprod.Notifications');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.Notifications} notifications
 */
dotprod.layers.NotificationLayer = function(notifications) {
  /**
   * @type {!dotprod.Notifications}
   * @private
   */
  this.notifications_ = notifications;
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.layers.NotificationLayer.MESSAGE_PERIOD_ = 200;

/**
 * @override
 */
dotprod.layers.NotificationLayer.prototype.update = function() {
  var messages = this.notifications_.getMessages();
  for (var i = 0; i < messages.length; ++i) {
    if (messages[i]) {
      ++messages[i].ticks;
      if (messages[i].ticks >= dotprod.layers.NotificationLayer.MESSAGE_PERIOD_) {
        messages[i] = null;
      }
    }
  }  
};

/**
 * @param {dotprod.Camera} camera
 * @override
 */
dotprod.layers.NotificationLayer.prototype.render = function(camera) {
  var context = camera.getContext();
  var messages = this.notifications_.getMessages();
  var font = dotprod.FontFoundry.notificationsFont();

  context.save();
    context.font = font;

    for (var i = 0; i < messages.length; ++i) {
      if (!messages[i]) {
        continue;
      }

      var opacity = 1.0 - messages[i].ticks / dotprod.layers.NotificationLayer.MESSAGE_PERIOD_;

      // TODO(sharvil): don't hard-code text position.
      context.fillStyle = dotprod.Palette.notificationsColor(opacity);
      context.textAlign = 'center';
      context.fillText(messages[i].text, 400, i * font.getLineHeight() + 220);
    }

  context.restore();
};
