/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.graphics.Layer');

/**
 * @enum {number}
 */
dotprod.graphics.Layer = {
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
dotprod.graphics.NUM_LAYERS = 7;
