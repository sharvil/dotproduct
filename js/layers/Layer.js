/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.layers.Layer');

/**
 * @interface
 */
dotprod.layers.Layer = goog.nullFunction;

dotprod.layers.Layer.prototype.update = goog.abstractMethod;

/**
 * @param {!dotprod.Viewport} viewport
 */
dotprod.layers.Layer.prototype.render = goog.abstractMethod;
