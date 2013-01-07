/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.NotificationLayer');

goog.require('goog.asserts');

goog.require('dotprod.FontFoundry');
goog.require('dotprod.graphics.Drawable');
goog.require('dotprod.graphics.Painter.Layer');
goog.require('dotprod.model.ModelObject');
goog.require('dotprod.Palette');
goog.require('dotprod.Notifications');
goog.require('dotprod.Viewport');

/**
 * @constructor
 * @extends {dotprod.model.ModelObject}
 * @implements {dotprod.graphics.Drawable}
 * @param {!dotprod.Game} game
 * @param {!dotprod.Notifications} notifications
 */
dotprod.layers.NotificationLayer = function(game, notifications) {
  goog.base(this, game.getSimulation());

  /**
   * @type {!dotprod.Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!dotprod.Notifications}
   * @private
   */
  this.notifications_ = notifications;

  game.getPainter().registerDrawable(dotprod.graphics.Painter.Layer.HUD, this);
};
goog.inherits(dotprod.layers.NotificationLayer, dotprod.model.ModelObject);

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
dotprod.layers.NotificationLayer.prototype.advanceTime = function() {
  this.notifications_.forEach(function(message, index) {
    ++message.ticks;
  });
};

/**
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

/**
 * @override
 */
dotprod.layers.NotificationLayer.prototype.onInvalidate_ = function() {
  goog.asserts.assert(false, 'Notification layer should never be invalidated.');
};
