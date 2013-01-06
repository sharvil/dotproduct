/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Drawable');

/**
 * @interface
 */
dotprod.Drawable = goog.nullFunction;

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.Drawable.prototype.render = goog.abstractMethod;
