goog.provide('ObjectType');
goog.provide('PrizeType');
goog.provide('TileType');
goog.provide('ToggleState');

/**
 * @enum {number}
 */
ToggleState = {
  UNAVAILABLE: 0,
  DISABLED: 1,
  ENABLED: 2
};

/**
 * @enum {number}
 */
ObjectType = {
  NONE: 0,
  PRIZE: 1,
  FLAG: 2
};

/**
 * @enum {number}
 */
PrizeType = {
  NONE: 0,
  GUN_UPGRADE: 1,
  BOMB_UPGRADE: 2,
  FULL_ENERGY: 3,
  BOUNCING_BULLETS: 4,
  MULTIFIRE: 5
};

/**
 * @enum {number}
 */
TileType = {
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
