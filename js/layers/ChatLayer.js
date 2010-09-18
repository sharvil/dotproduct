/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.ChatLayer');

goog.require('dotprod.Camera');
goog.require('dotprod.ChatMessages');
goog.require('dotprod.layers.Layer');

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
 * @param {dotprod.Camera} camera
 * @override
 */
dotprod.layers.ChatLayer.prototype.render = function(camera) {
  var context = camera.getContext();
  var dimensions = camera.getDimensions();
  var messages = this.messages_.getMessages();

  context.save();
    context.font = '12px "Courier New"';

    for (var i = 0; i < messages.length; ++i) {
      context.fillStyle = '#fff';
      context.fillText(messages[i], 5, dimensions.height - 5 - 12 * i);
    }

  context.restore();
};
