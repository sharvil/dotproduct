goog.provide('PrizeIndex');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('math.Prng');
goog.require('model.Prize');

/**
 * @constructor
 * @param {!Game} game
 */
PrizeIndex = function(game) {
  /**
   * @type {!model.Simulation}
   * @private
   */
  this.simulation_ = game.getSimulation();

  /**
   * @type {!Object}
   */
  this.prizeSettings_ = game.getSettings()['prize'];

  /**
   * @type {!model.Map}
   * @private
   */
  this.map_ = game.getMap();

  /**
   * @type {!math.Prng}
   * @private
   */
  this.prng_ = new math.Prng();

  /**
   * This PRNG doesn't need to be synchronized across clients. We use
   * it to generate kill prize types and to avoid getting this.prng_
   * out of sync.
   *
   * @type {!math.Prng}
   * @private
   */
  this.killPrng_ = new math.Prng();

  /**
   * @type {!Array.<model.Prize>}
   * @private
   */
  this.prizes_ = [];
};

/**
 * @param {number} x
 * @param {number} y
 */
PrizeIndex.prototype.addKillPrize = function(x, y) {
  var coordinates = this.map_.toTileCoordinates(new math.Vector(x, y));
  var xTile = coordinates.getX();
  var yTile = coordinates.getY();

  if (this.map_.getTile(xTile, yTile) == 0) {
    var type = this.generatePrizeType_(this.killPrng_);
    var ttl = this.generateTimeToLive_(this.killPrng_);
    var prize = new model.Prize(this.simulation_, this.map_, type, xTile, yTile, ttl);
    this.prizes_.push(prize);
  }
};

/**
 * @param {number} seed
 * @param {number} fastForwardTicks
 */
PrizeIndex.prototype.onSeedUpdate = function(seed, fastForwardTicks) {
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
      var prize = new model.Prize(this.simulation_, this.map_, type, xTile, yTile, ttl);
      this.prizes_.push(prize);
    }
  }

  this.advanceTime_(fastForwardTicks);
};

/**
 * @param {number} x
 * @param {number} y
 * @return {model.Prize}
 */
PrizeIndex.prototype.getPrize = function(x, y) {
  return /** @type {model.Prize} */ (goog.array.find(this.prizes_, function(prize) {
    return prize.isValid() && prize.getX() == x && prize.getY() == y;
  }));
};

/**
 * @param {!model.Prize} prize
 */
PrizeIndex.prototype.removePrize = function(prize) {
  goog.array.remove(this.prizes_, prize);
  prize.invalidate();
};

/**
 * @param {number=} opt_fastForwardTicks
 * @private
 */
PrizeIndex.prototype.advanceTime_ = function(opt_fastForwardTicks) {
  this.forEach(function(prize) {
    prize.advanceTime(opt_fastForwardTicks);
  });
};

/**
 * @param {function(!model.Prize)} cb
 */
PrizeIndex.prototype.forEach = function(cb) {
  this.prizes_ = goog.array.filter(this.prizes_, function(prize) { return prize.isValid(); });
  goog.array.forEach(this.prizes_, function(prize) {
    goog.asserts.assert(!!prize, 'Null prize found in prize index.');
    cb(prize);
  });
};

/**
 * @param {!math.Prng} prng
 * @return {!PrizeType}
 * @private
 */
PrizeIndex.prototype.generatePrizeType_ = function(prng) {
  var prizeWeights = this.prizeSettings_['weights'];

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

  return /** @type {!PrizeType} */ (type);
};

/**
 * @param {!math.Prng} prng
 * @return {number}
 * @private
 */
PrizeIndex.prototype.generateTimeToLive_ = function(prng) {
  return prng.random() % this.prizeSettings_['decayTime'] + 1;
};
