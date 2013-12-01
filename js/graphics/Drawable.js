/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('graphics.Drawable');

/**
 * @interface
 */
graphics.Drawable = goog.nullFunction;

/**
 * @param {!Viewport} viewport
 */
graphics.Drawable.prototype.render = goog.abstractMethod;
