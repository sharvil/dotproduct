/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.PrizeType');
goog.provide('dotprod.TileType');

/**
 * @enum {number}
 */
dotprod.PrizeType = {
  NONE: 0,
  GUN_UPGRADE: 1,
  BOMB_UPGRADE: 2,
  FULL_ENERGY: 3,
  BOUNCING_BULLETS: 4
};

/**
 * @enum {number}
 */
dotprod.TileType = {
  NONE: 0,
  SAFE: 1,
  PRIZE: 2
};
