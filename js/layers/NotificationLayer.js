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
  this.notifications_.forEach(function(message, index) {
    ++message.ticks;
  });
};

/**
 * @param {dotprod.Camera} camera
 * @override
 */
dotprod.layers.NotificationLayer.prototype.render = function(camera) {
  var context = camera.getContext();
  var font = dotprod.FontFoundry.notificationsFont();

  context.save();
    context.font = font;

    this.notifications_.forEach(function(message, index) {
      if (message.ticks >= dotprod.layers.NotificationLayer.MESSAGE_PERIOD_) {
        return;
      }

      var opacity = 1.0 - message.ticks / dotprod.layers.NotificationLayer.MESSAGE_PERIOD_;

      // TODO(sharvil): don't hard-code text position.
      context.fillStyle = dotprod.Palette.notificationsColor(opacity);
      context.textAlign = 'center';
      context.fillText(message.text, 400, index * font.getLineHeight() + 220);
    });

  context.restore();
};
