/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ChatLayer');

goog.require('dotprod.ChatMessages');
goog.require('dotprod.FontFoundry');
goog.require('dotprod.layers.Layer');
goog.require('dotprod.Palette');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 * @param {!dotprod.ChatMessages} messages
 */
dotprod.layers.ChatLayer = function(messages) {
  /**
   * @type {!dotprod.ChatMessages}
   * @private
   */
  this.messages_ = messages;
};

/**
 * @override
 */
dotprod.layers.ChatLayer.prototype.update = goog.nullFunction;

/**
 * @param {!dotprod.Camera} camera
 * @override
 */
dotprod.layers.ChatLayer.prototype.render = function(camera) {
  var context = camera.getContext();
  var dimensions = camera.getDimensions();

  var gradient = context.createLinearGradient(0, dimensions.height - 8 - 8 * 12, 0, dimensions.height);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');

  context.save();
    context.fillStyle = gradient;
    context.fillRect(0, dimensions.height - 8 - 8 * 12, dimensions.width, dimensions.height);
    context.font = dotprod.FontFoundry.chatFont();

    var i = 0;
    this.messages_.forEach(function(item) {
      var y = dimensions.height - 8 - 12 * i++;
      var nameField = item.player.getName() + ': ';
      var nameFieldLength = context.measureText(nameField).width;

      context.fillStyle = dotprod.Palette.chatNameColor();
      context.fillText(nameField, 8, y);

      context.fillStyle = dotprod.Palette.chatTextColor();
      context.fillText(item.message, 8 + nameFieldLength, y);
    });

  context.restore();
};
