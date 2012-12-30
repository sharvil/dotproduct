/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.sprites.Sprite');

/**
 * @interface
 */
dotprod.sprites.Sprite = goog.nullFunction;

dotprod.sprites.Sprite.prototype.update = goog.abstractMethod;

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.sprites.Sprite.prototype.render = goog.abstractMethod;
