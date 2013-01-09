/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.graphics.Painter');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('dotprod.graphics.Layer');

/**
 * @constructor
 */
dotprod.graphics.Painter = function() {
  /**
   * @type {!Array.<Array.<!dotprod.graphics.Drawable>>}
   * @private
   */
  this.layers_ = [];

  for (var i = 0; i < dotprod.graphics.NUM_LAYERS; ++i) {
    this.layers_.push([]);
  }
};

/**
 * @param {dotprod.graphics.Layer} layer
 * @param {!dotprod.graphics.Drawable} drawable
 */
dotprod.graphics.Painter.prototype.registerDrawable = function(layer, drawable) {
  goog.asserts.assert(layer >= 0 && layer < dotprod.graphics.NUM_LAYERS, 'Invalid layer id: ' + layer);
  goog.array.extend(this.layers_[layer], drawable);
};

/**
 * @param {dotprod.graphics.Layer} layer
 * @param {!dotprod.graphics.Drawable} drawable
 */
dotprod.graphics.Painter.prototype.unregisterDrawable = function(layer, drawable) {
  goog.asserts.assert(layer >= 0 && layer < dotprod.graphics.NUM_LAYERS, 'Invalid layer id: ' + layer);
  goog.array.remove(this.layers_[layer], drawable);
};

/**
 * @param {!dotprod.Viewport} viewport
 */
dotprod.graphics.Painter.prototype.render = function(viewport) {
  var context = viewport.getContext();
  context.save();
    context.fillStyle = '#000';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    for (var i = 0; i < this.layers_.length; ++i) {
      goog.array.forEach(this.layers_[i], function(drawable) {
        drawable.render(viewport);
      });
    }
  context.restore();
};
