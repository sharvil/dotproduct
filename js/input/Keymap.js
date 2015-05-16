goog.provide('input.Keymap');

goog.require('goog.events.KeyCodes');

/**
 * @enum {goog.events.KeyCodes}
 */
input.Keymap = {
  FORWARD_THRUST: goog.events.KeyCodes.UP,
  REVERSE_THRUST: goog.events.KeyCodes.DOWN,
  ROTATE_LEFT: goog.events.KeyCodes.LEFT,
  ROTATE_RIGHT: goog.events.KeyCodes.RIGHT,

  FIRE_GUN: goog.events.KeyCodes.SPACE,
  FIRE_BOMB: goog.events.KeyCodes.F,
  FIRE_MINE: goog.events.KeyCodes.V,
  FIRE_BURST: goog.events.KeyCodes.G,
  FIRE_DECOY: goog.events.KeyCodes.D,

  TOGGLE_MULTIFIRE: goog.events.KeyCodes.M,

  AFTERBURNER: goog.events.KeyCodes.A
};
