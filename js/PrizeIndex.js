/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.PrizeIndex');

goog.require('dotprod.math.Prng');
goog.require('dotprod.Prize');
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
   * @type {!dotprod.math.Prng}
   * @private
   */
  this.prng_ = new dotprod.math.Prng();

  /**
   * This PRNG doesn't need to be synchronized across clients. We use
   * it to generate kill prize types and to avoid getting this.prng_
   * out of sync.
   *
   * @type {!dotprod.Prng}
   * @private
   */
  this.killPrng_ = new dotprod.math.Prng();

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
  var coordinates = this.map_.toTileCoordinates(new dotprod.math.Vector(x, y));
  var xTile = coordinates.getX();
  var yTile = coordinates.getY();

  if (this.map_.getTile(xTile, yTile) == 0) {
    var type = this.generatePrizeType_(this.killPrng_);
    var ttl = this.generateTimeToLive_(this.killPrng_);
    var prize = new dotprod.Prize(type, xTile, yTile, ttl);
    this.map_.setTile(xTile, yTile, 255);
    this.prizes_.push(prize);
  }
};

/**
 * @param {number} seed
 * @param {number} fastForwardTicks
 */
dotprod.PrizeIndex.prototype.onSeedUpdate = function(seed, fastForwardTicks) {
  // Set the seed.
  this.prng_.seed(seed);
  this.killPrng_.seed(this.killPrng_.random() ^ seed);

  // Create prizes using new seed.
  var prizeRadius = this.prizeSettings_['radius'];
  for (var i = 0; i < this.prizeSettings_['count']; ++i) {
    var type = this.generatePrizeType_(this.prng_);
    var ttl = this.generateTimeToLive_(this.prng_);

    // Generate random coordinates in the range [-prizeRadius, prizeRadius) and offset by the center of the map.
    var xTile = Math.floor(this.map_.getWidth() / 2 + this.prng_.random() % prizeRadius * 2 - prizeRadius);
    var yTile = Math.floor(this.map_.getHeight() / 2 + this.prng_.random() % prizeRadius * 2 - prizeRadius);

    if (this.map_.getTile(xTile, yTile) == 0) {
      var prize = new dotprod.Prize(type, xTile, yTile, ttl);
      this.map_.setTile(xTile, yTile, 255);
      this.prizes_.push(prize);
    }
  }

  this.update_(fastForwardTicks);
};

/**
 * @param {number} x
 * @param {number} y
 * @return {dotprod.Prize}
 */
dotprod.PrizeIndex.prototype.getPrize = function(x, y) {
  return goog.array.find(this.prizes_, function(prize) {
    return prize != null && prize.isAlive() && prize.getX() == x && prize.getY() == y;
  });
};

/**
 * @param {!dotprod.Prize} prize
 */
dotprod.PrizeIndex.prototype.removePrize = function(prize) {
  var prizeIndex = goog.array.findIndex(this.prizes_, function(p) {
    return p != null && p.isAlive() == prize.isAlive() && prize.getX() == p.getX() && prize.getY() == p.getY();
  });

  if (prizeIndex == -1) {
    return null;
  }

  this.prizes_[prizeIndex] = null;
  this.map_.setTile(prize.getX(), prize.getY(), 0);
};

dotprod.PrizeIndex.prototype.update = function() {
  this.update_(1);
};

/**
 * @param {number=} opt_fastForwardTicks
 */
dotprod.PrizeIndex.prototype.update_ = function(opt_fastForwardTicks) {
  for (var i = 0; i < this.prizes_.length; ++i) {
    var prize = this.prizes_[i];
    if (prize) {
      prize.update(opt_fastForwardTicks);
      if (!prize.isAlive()) {
        this.prizes_[i] = null;
        this.map_.setTile(prize.getX(), prize.getY(), 0);
      }
    }
  }
};

/**
 * @param {function(!dotprod.Prize)} cb
 */
dotprod.PrizeIndex.prototype.forEach = function(cb) {
  goog.array.forEach(this.prizes_, function(prize) {
    if (prize != null && prize.isAlive()) {
      cb(prize);
    }
  });
};

/**
 * @param {!dotprod.math.Prng} prng
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

/**
 * @param {!dotprod.math.Prng} prng
 * @return {number}
 */
dotprod.PrizeIndex.prototype.generateTimeToLive_ = function(prng) {
  return prng.random() % this.prizeSettings_['decayTime'] + 1;
};
