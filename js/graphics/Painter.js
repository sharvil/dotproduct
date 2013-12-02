goog.provide('graphics.Painter');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('graphics.Layer');

/**
 * @constructor
 */
graphics.Painter = function() {
  /**
   * @type {!Array.<Array.<!graphics.Drawable>>}
   * @private
   */
  this.layers_ = [];

  for (var i = 0; i < graphics.NUM_LAYERS; ++i) {
    this.layers_.push([]);
  }
};

/**
 * @param {graphics.Layer} layer
 * @param {!graphics.Drawable} drawable
 */
graphics.Painter.prototype.registerDrawable = function(layer, drawable) {
  goog.asserts.assert(layer >= 0 && layer < graphics.NUM_LAYERS, 'Invalid layer id: ' + layer);
  goog.array.extend(this.layers_[layer], drawable);
};

/**
 * @param {graphics.Layer} layer
 * @param {!graphics.Drawable} drawable
 */
graphics.Painter.prototype.unregisterDrawable = function(layer, drawable) {
  goog.asserts.assert(layer >= 0 && layer < graphics.NUM_LAYERS, 'Invalid layer id: ' + layer);
  goog.array.remove(this.layers_[layer], drawable);
};

/**
 * @param {!Viewport} viewport
 */
graphics.Painter.prototype.render = function(viewport) {
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
