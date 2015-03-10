goog.provide('layers.Starfield');

goog.require('graphics.Drawable');
goog.require('graphics.Layer');
goog.require('math.Prng');
goog.require('Viewport');

/**
 * @constructor
 * @implements {graphics.Drawable}
 * @param {!Game} game
 */
layers.Starfield = function(game) {
  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * Position of large stars (these stars are bitmaps, not just pixels).
   *
   * @type {!Array.<!Object>}
   * @private
   */
  this.bigStars_ = [];

  /**
   * Pattern for the general L1 and L2 starsfields.
   *
   * @type {!Array.<!Object>}
   * @private
   */
  this.stars_ = [];

  // TODO(sharvil): seed this PRNG with something map-unique so
  // we get a map-specific stable, random star pattern.
  var rng = new math.Prng();
  var map = game.getMap();
  var mapWidth = map.getTileWidth() * map.getWidth();
  var mapHeight = map.getTileHeight() * map.getHeight();
  for (var i = 0; i < layers.Starfield.NUM_LARGE_STARS_; ++i) {
    var star = {
      asset: 'star' + (rng.random() % 6),
      x: rng.random() % mapWidth,
      y: rng.random() % mapHeight
    };
    this.bigStars_.push(star);
  }

  for (var i = 0; i < layers.Starfield.STAR_DENSITY_; ++i) {
    var star = {
      x: Math.round(Math.random() * layers.Starfield.STAR_TILE_SIZE_),
      y: Math.round(Math.random() * layers.Starfield.STAR_TILE_SIZE_)
    };
    this.stars_.push(star);
  }

  game.getPainter().registerDrawable(graphics.Layer.STARFIELD, this);
};

/**
 * @const
 * @type {number}
 * @private
 */
layers.Starfield.NUM_LARGE_STARS_ = 256;

/**
 * @const
 * @type {number}
 * @private
 */
layers.Starfield.STAR_DENSITY_ = 32;

/**
 * @const
 * @type {number}
 * @private
 */
layers.Starfield.STAR_TILE_SIZE_ = 1024;

/**
 * @const
 * @type {string}
 * @private
 */
layers.Starfield.STAR_L1_COLOR_ = 'rgb(184, 184, 184)';

/**
 * @const
 * @type {string}
 * @private
 */
layers.Starfield.STAR_L2_COLOR_ = 'rgb(96, 96, 96)';

/**
 * @override
 */
layers.Starfield.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();
  var x = dimensions.x;
  var y = dimensions.y;
  var w = dimensions.width;
  var h = dimensions.height;

  context.save();

    var leftTile = Math.floor((x - w * 1.5) / layers.Starfield.STAR_TILE_SIZE_);
    var rightTile = Math.floor((x + w * 1.5) / layers.Starfield.STAR_TILE_SIZE_);
    var topTile = Math.floor((y - h * 1.5) / layers.Starfield.STAR_TILE_SIZE_);
    var bottomTile = Math.floor((y + h * 1.5) / layers.Starfield.STAR_TILE_SIZE_);

    context.fillStyle = layers.Starfield.STAR_L2_COLOR_;
    for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
      for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
        for (var i = 0; i < this.stars_.length; ++i) {
          // Instead of simply stamping each tile onto the screen, make it look a little
          // more random by multiplying (modulo tile size) by the tile number. This way
          // each tile will have a unique pattern and won't look repetitive. Multiply by
          // another 31 to make this star pattern look different than the equivalent for
          // the L1 stars.
          var tiledX = (31 * xTile * this.stars_[i].x) % layers.Starfield.STAR_TILE_SIZE_;
          var tiledY = (31 * yTile * this.stars_[i].y) % layers.Starfield.STAR_TILE_SIZE_;

          var dx = Math.floor((xTile * layers.Starfield.STAR_TILE_SIZE_ + tiledX - x) / 3 + w / 2);
          var dy = Math.floor((yTile * layers.Starfield.STAR_TILE_SIZE_ + tiledY - y) / 3 + h / 2);
          context.fillRect(dx, dy, 1, 1);
        }
      }
    }

    leftTile = Math.floor((x - w) / layers.Starfield.STAR_TILE_SIZE_);
    rightTile = Math.floor((x + w) / layers.Starfield.STAR_TILE_SIZE_);
    topTile = Math.floor((y - h) / layers.Starfield.STAR_TILE_SIZE_);
    bottomTile = Math.floor((y + h) / layers.Starfield.STAR_TILE_SIZE_);

    context.fillStyle = layers.Starfield.STAR_L1_COLOR_;
    for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
      for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
        for (var i = 0; i < this.stars_.length; ++i) {
          // Instead of simply stamping each tile onto the screen, make it look a little
          // more random by multiplying (modulo tile size) by the tile number. This way
          // each tile will have a unique pattern and won't look repetitive.
          var tiledX = (xTile * this.stars_[i].x) % layers.Starfield.STAR_TILE_SIZE_;
          var tiledY = (yTile * this.stars_[i].y) % layers.Starfield.STAR_TILE_SIZE_;

          var dx = Math.floor((xTile * layers.Starfield.STAR_TILE_SIZE_ + tiledX - x + w) / 2);
          var dy = Math.floor((yTile * layers.Starfield.STAR_TILE_SIZE_ + tiledY - y + h) / 2);
          context.fillRect(dx, dy, 1, 1);
        }
      }
    }

    for (var i = 0; i < this.bigStars_.length; ++i) {
      var star = this.bigStars_[i];
      var image = this.game_.getResourceManager().getImage(star.asset);
      image.render(context, Math.round(star.x - (x * 0.6)), Math.round(star.y - (y * 0.6)));
    }

  context.restore();
};
