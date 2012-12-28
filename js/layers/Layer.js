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
dotprod.layers.Layer.prototype.render = goog.abstractMethod;
