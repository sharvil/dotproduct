/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.PrizeIndex');

goog.require('dotprod.Prize');
goog.require('dotprod.Prng');
goog.require('goog.array');

/**
 * @constructor
 * @param {!dotprod.Game}
 */
dotprod.PrizeIndex = function(game) {
  /**
   * @type {!Object}
   */
  this.settings_ = game.getSettings();

  /**
   * @type {!dotprod.Map}
   * @private
   */
  this.map_ = game.getMap();

  /**
   * @type {!dotprod.Prng}
   * @private
   */
  this.prng_ = new dotprod.Prng();

  /**
   * @type {!Array.<dotprod.Prize>}
   * @private
   */
  this.prizes_ = [];
};

/**
 * @param {number} seed
 * @param {number} fastForwardTicks
 */
dotprod.PrizeIndex.prototype.onSeedUpdate = function(seed, fastForwardTicks) {
  // Remove all existing prizes from the map.
  goog.array.forEach(this.prizes_, goog.bind(function(prize) {
    if (prize) {
      this.map_.setTile(prize.getX(), prize.getY(), 0);
    }
  }, this));
  this.prizes_ = [];

  // Set the seed.
  this.prng_.seed(seed);

  // Create prizes using new seed.
  for (var i = 0; i < this.settings_['prize']['count']; ++i) {
    var type = this.prng_.random() % dotprod.Prize.NUM_PRIZE_TYPES;
    var xTile = this.prng_.random() % this.map_.getWidth();
    var yTile = this.prng_.random() % this.map_.getHeight();

    if (this.map_.getTile(xTile, yTile) == 0) {
      var prize = new dotprod.Prize(type, xTile, yTile);
      this.map_.setTile(xTile, yTile, 255);
      this.prizes_.push(prize);
    }
  }

  // Decay all prizes by the fast forward time.
  for (var i = 0; i < fastForwardTicks; ++i) {
    this.update();
  }
};

/**
 * @param {number} x
 * @param {number} y
 * @return {dotprod.Prize}
 */
dotprod.PrizeIndex.prototype.removePrize = function(x, y) {
  var prizeIndex = goog.array.findIndex(this.prizes_, function(prize) {
    return prize != null && prize.getX() == x && prize.getY() == y;
  });

  if (prizeIndex == -1) {
    return null;
  }

  var prize = this.prizes_[prizeIndex];
  this.prizes_[prizeIndex] = null;
  this.map_.setTile(prize.getX(), prize.getY(), 0);
  return prize;
};

dotprod.PrizeIndex.prototype.update = function() {
  for (var i = 0; i < this.prizes_.length; ++i) {
    var prize = this.prizes_[i];
    if (prize) {
      prize.update();
      if (!prize.isAlive()) {
        this.prizes_[i] = null;
      }
    }
  }
};
