/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.graphics.Painter');
goog.provide('dotprod.graphics.Painter.Layer');

goog.require('goog.array');
goog.require('goog.asserts');

/**
 * @constructor
 */
dotprod.graphics.Painter = function() {
  /**
   * @type {!Array.<Array.<!dotprod.graphics.Drawable>>}
   * @private
   */
  this.layers_ = [];

  for (var i = 0; i < dotprod.graphics.Painter.NUM_LAYERS_; ++i) {
    this.layers_.push([]);
  }
};

/**
 * @enum {number}
 */
dotprod.graphics.Painter.Layer = {
  STARFIELD: 0,
  MAP: 1,
  PROJECTILES: 2,
  PLAYERS: 3,
  LOCAL_PLAYER: 4,
  EFFECTS: 5,
  HUD: 6
};

/**
 * @type {number}
 * @const
 * @private
 */
dotprod.graphics.Painter.NUM_LAYERS_ = 7;

/**
 * @param {dotprod.graphics.Painter.Layer} layer
 * @param {!dotprod.graphics.Drawable} drawable
 */
dotprod.graphics.Painter.prototype.registerDrawable = function(layer, drawable) {
  goog.asserts.assert(layer >= 0 && layer < dotprod.graphics.Painter.NUM_LAYERS_, 'Invalid layer id: ' + layer);
  goog.array.extend(this.layers_[layer], drawable);
};

/**
 * @param {dotprod.graphics.Painter.Layer} layer
 * @param {!dotprod.graphics.Drawable} drawable
 */
dotprod.graphics.Painter.prototype.unregisterDrawable = function(layer, drawable) {
  goog.asserts.assert(layer >= 0 && layer < dotprod.graphics.Painter.NUM_LAYERS_, 'Invalid layer id: ' + layer);
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
