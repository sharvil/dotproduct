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
  TRAILS: 2,
  PROJECTILES: 3,
  PLAYERS: 4,
  LOCAL_PLAYER: 5,
  EFFECTS: 6,
  HUD: 7
};

/**
 * @type {number}
 * @const
 */
dotprod.graphics.NUM_LAYERS = 8;
