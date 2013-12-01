/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('layers.NotificationLayer');

goog.require('goog.asserts');

goog.require('Font');
goog.require('graphics.Drawable');
goog.require('graphics.Layer');
goog.require('model.ModelObject');
goog.require('Palette');
goog.require('Notifications');
goog.require('Viewport');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!Notifications} notifications
 */
layers.NotificationLayer = function(game, notifications) {
  goog.base(this, game.getSimulation());

  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!Notifications}
   * @private
   */
  this.notifications_ = notifications;

  game.getPainter().registerDrawable(graphics.Layer.HUD, this);
};
goog.inherits(layers.NotificationLayer, model.ModelObject);

/**
 * @type {number}
 * @private
 * @const
 */
layers.NotificationLayer.MESSAGE_PERIOD_ = 150;

/**
 * @type {number}
 * @private
 * @const
 */
layers.NotificationLayer.FADE_PERIOD_ = 50;

/**
 * @override
 */
layers.NotificationLayer.prototype.advanceTime = function() {
  this.notifications_.forEach(function(message, index) {
    ++message.ticks;
  });
};

/**
 * @override
 */
layers.NotificationLayer.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var font = Font.notificationsFont();

  context.save();
    context.font = font;

    this.notifications_.forEach(function(message, index) {
      if (message.ticks >= layers.NotificationLayer.MESSAGE_PERIOD_ + layers.NotificationLayer.FADE_PERIOD_) {
        return;
      }

      var opacity = 1;
      if (message.ticks > layers.NotificationLayer.MESSAGE_PERIOD_) {
        opacity -= (message.ticks - layers.NotificationLayer.MESSAGE_PERIOD_) / layers.NotificationLayer.FADE_PERIOD_;
      }

      // TODO(sharvil): don't hard-code text position.
      switch (message.type) {
        case Notifications.Type.PERSONAL:
          context.fillStyle = Palette.personalNotificationsColor(opacity);
          break;
        case Notifications.Type.ENTER:
          context.fillStyle = Palette.enterNotificationsColor(opacity);
          break;
        default:
          context.fillStyle = Palette.notificationsColor(opacity);
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
layers.NotificationLayer.prototype.onInvalidate_ = function() {
  goog.asserts.assert(false, 'Notification layer should never be invalidated.');
};
