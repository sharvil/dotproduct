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
 * @param {!dotprod.Game} game
 */
dotprod.PrizeIndex = function(game) {
  /**
   * @type {!Object}
   */
  this.prizeSettings_ = game.getSettings()['prize'];

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
   * This PRNG doesn't need to be synchronized across clients. We use
   * it to generate kill prize types and to avoid getting this.prng_
   * out of sync.
   *
   * @type {!dotprod.Prng}
   * @private
   */
  this.killPrng_ = new dotprod.Prng();

  /**
   * @type {!Array.<dotprod.Prize>}
   * @private
   */
  this.prizes_ = [];
};

/**
 * @param {number} x
 * @param {number} y
 */
dotprod.PrizeIndex.prototype.addKillPrize = function(x, y) {
  var coordinates = this.map_.toTileCoordinates(new dotprod.Vector(x, y));
  var xTile = coordinates.getX();
  var yTile = coordinates.getY();

  if (this.map_.getTile(xTile, yTile) == 0) {
    var type = this.generatePrizeType_(this.killPrng_);
    var prize = new dotprod.Prize(type, xTile, yTile);
    this.map_.setTile(xTile, yTile, 255);
    this.prizes_.push(prize);
  }
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
  this.killPrng_.seed(this.killPrng_.random() ^ seed);

  // Create prizes using new seed.
  for (var i = 0; i < this.prizeSettings_['count']; ++i) {
    var type = this.generatePrizeType_(this.prng_);
    var xTile = this.prng_.random() % this.map_.getWidth();
    var yTile = this.prng_.random() % this.map_.getHeight();

    if (this.map_.getTile(xTile, yTile) == 0) {
      var prize = new dotprod.Prize(type, xTile, yTile);
      this.map_.setTile(xTile, yTile, 255);
      this.prizes_.push(prize);
    }
  }

  // TODO(sharvil): re-enable this when prize decay is implemented.
  // Decay all prizes by the fast forward time.
  // for (var i = 0; i < fastForwardTicks; ++i) {
  //   this.update();
  // }
};

/**
 * @param {number} x
 * @param {number} y
 * @return {dotprod.Prize}
 */
dotprod.PrizeIndex.prototype.getPrize = function(x, y) {
  return goog.array.find(this.prizes_, function(prize) {
    return prize != null && prize.getX() == x && prize.getY() == y;
  });
};

/**
 * @param {!dotprod.Prize} prize
 */
dotprod.PrizeIndex.prototype.removePrize = function(prize) {
  var prizeIndex = goog.array.findIndex(this.prizes_, function(p) {
    return p != null && prize.getX() == p.getX() && prize.getY() == p.getY();
  });

  if (prizeIndex == -1) {
    return null;
  }

  this.prizes_[prizeIndex] = null;
  this.map_.setTile(prize.getX(), prize.getY(), 0);
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

/**
 * @param {!dotprod.Prng} prng
 * @return {!dotprod.Prize.Type}
 */
dotprod.PrizeIndex.prototype.generatePrizeType_ = function(prng) {
  var prizeWeights = this.prizeSettings_['weights'];
  goog.asserts.assert(prizeWeights.length == dotprod.Prize.NUM_PRIZE_TYPES, 'Prize weights do not match prize types.');

  var sum = 0;
  for (var i = 0; i < prizeWeights.length; ++i) {
    sum += prizeWeights[i];
  }

  goog.asserts.assert(sum > 0, 'Prize weights must be greater than 0.');

  var type;
  var variate = prng.random() % sum;
  for (type = 0, sum = 0; type < prizeWeights.length; ++type) {
    sum += prizeWeights[type];
    if (sum > variate) {
      break;
    }
  }

  return /** @type {!dotprod.Prize.Type} */ (type);
};
