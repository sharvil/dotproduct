/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.NotificationLayer');

goog.require('dotprod.Camera');
goog.require('dotprod.layers.Layer');

/**
 * @constructor
 * @implements {dotprod.layers.Layer}
 */
dotprod.layers.NotificationLayer = function() {
  /**
   * @type {!Array.<Object>}
   */
  this.messages_ = [];
  for (var i = 0; i < dotprod.layers.NotificationLayer.MAX_MESSAGES_; ++i) {
    this.messages_.push(null);
  }

  /**
   * @type {number}
   * @private
   */
  this.insertIndex_ = 0;
};

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.layers.NotificationLayer.MAX_MESSAGES_ = 5;

/**
 * @type {number}
 * @private
 * @const
 */
dotprod.layers.NotificationLayer.MESSAGE_PERIOD_ = 200;

/**
 * @param {string} message
 */
dotprod.layers.NotificationLayer.prototype.addMessage = function(message) {
  this.messages_[this.insertIndex_] = {text: message, ticks: 0};
  this.insertIndex_ = (this.insertIndex_ + 1) % this.messages_.length;
};

/**
 * @param {number} timeDiff
 * @override
 */
dotprod.layers.NotificationLayer.prototype.update = function(timeDiff) {
  for (var i = 0; i < this.messages_.length; ++i) {
    if (this.messages_[i]) {
      this.messages_[i].ticks += timeDiff;
      if (this.messages_[i].ticks >= dotprod.layers.NotificationLayer.MESSAGE_PERIOD_) {
        this.messages_[i] = null;
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

  context.save();
    context.font = '12px Verdana';

    for (var i = 0; i < this.messages_.length; ++i) {
      if (!this.messages_[i]) {
        continue;
      }

      var opacity = 1.0 - this.messages_[i].ticks / dotprod.layers.NotificationLayer.MESSAGE_PERIOD_;

      // TODO(sharvil): don't hard-code font, font size, color, or text position.
      context.fillStyle = 'rgba(255, 255, 255,' + opacity + ')';
      context.textAlign = 'center';
      context.fillText(this.messages_[i].text, 400, i * 13 + 220);
    }

  context.restore();
};
