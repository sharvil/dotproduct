/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.NotificationLayer');

goog.require('dotprod.Viewport');
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
dotprod.layers.NotificationLayer.MESSAGE_PERIOD_ = 150;

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.layers.NotificationLayer.FADE_PERIOD_ = 50;

/**
 * @override
 */
dotprod.layers.NotificationLayer.prototype.update = function() {
  this.notifications_.forEach(function(message, index) {
    ++message.ticks;
  });
};

/**
 * @param {dotprod.Viewport} viewport
 * @override
 */
dotprod.layers.NotificationLayer.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var font = dotprod.FontFoundry.notificationsFont();

  context.save();
    context.font = font;

    this.notifications_.forEach(function(message, index) {
      if (message.ticks >= dotprod.layers.NotificationLayer.MESSAGE_PERIOD_ + dotprod.layers.NotificationLayer.FADE_PERIOD_) {
        return;
      }

      var opacity = 1;
      if (message.ticks > dotprod.layers.NotificationLayer.MESSAGE_PERIOD_) {
        opacity -= (message.ticks - dotprod.layers.NotificationLayer.MESSAGE_PERIOD_) / dotprod.layers.NotificationLayer.FADE_PERIOD_;
      }

      // TODO(sharvil): don't hard-code text position.
      switch (message.type) {
        case dotprod.Notifications.Type.PERSONAL:
          context.fillStyle = dotprod.Palette.personalNotificationsColor(opacity);
          break;
        case dotprod.Notifications.Type.ENTER:
          context.fillStyle = dotprod.Palette.enterNotificationsColor(opacity);
          break;
        default:
          context.fillStyle = dotprod.Palette.notificationsColor(opacity);
          break;
      }
      context.textAlign = 'center';
      context.fillText(message.text, 400, index * font.getLineHeight() + 220);
    });

  context.restore();
};
