/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.graphics.Drawable');

/**
 * @interface
 */
dotprod.graphics.Drawable = goog.nullFunction;

/**
 * @param {!dotprod.Viewport} viewport
 */
dotprod.graphics.Drawable.prototype.render = goog.abstractMethod;
