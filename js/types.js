/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.ObjectType');
goog.provide('dotprod.PrizeType');
goog.provide('dotprod.TileType');

/**
 * @enum {number}
 */
dotprod.ObjectType = {
  NONE: 0,
  PRIZE: 1,
  FLAG: 2
};

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
  COLLISION: 1,
  SAFE: 2,
  PRIZE: 3,
  ROCK1: 4,
  ROCK2: 5,
  ROCK3: 6,
  FRIEND_FLAG: 7,
  FOE_FLAG: 8
};
