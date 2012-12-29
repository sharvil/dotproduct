/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.input.Keymap');

goog.require('goog.events.KeyCodes');

/**
 * @enum {goog.events.KeyCodes}
 */
dotprod.input.Keymap = {
  FORWARD_THRUST: goog.events.KeyCodes.UP,
  REVERSE_THRUST: goog.events.KeyCodes.DOWN,
  ROTATE_LEFT: goog.events.KeyCodes.LEFT,
  ROTATE_RIGHT: goog.events.KeyCodes.RIGHT,

  FIRE_GUN: goog.events.KeyCodes.SPACE,
  FIRE_BOMB: goog.events.KeyCodes.F,

  STRAFE_LEFT: goog.events.KeyCodes.S,
  STRAFE_RIGHT: goog.events.KeyCodes.D,

  AFTERBURNER: goog.events.KeyCodes.A
};
