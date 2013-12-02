goog.provide('layers.Starfield');

goog.require('graphics.Drawable');
goog.require('graphics.Layer');
goog.require('Viewport');

/**
 * @constructor
 * @implements {graphics.Drawable}
 * @param {!Game} game
 */
layers.Starfield = function(game) {
  /**
   * Pattern for L1 stars (stars closer in distance).
   *
   * @type {!Array.<Object>}
   * @private
   */
  this.stars_ = [];

  /**
   * Pattern for L2 stars (stars further away in distance).
   *
   * @type {!Array.<Object>}
   * @private
   */
  this.stars2_ = [];

  for (var i = 0; i < layers.Starfield.STAR_DENSITY_; ++i) {
    var x1 = Math.round(Math.random() * layers.Starfield.STAR_TILE_SIZE_);
    var y1 = Math.round(Math.random() * layers.Starfield.STAR_TILE_SIZE_);
    this.stars_.push({x: x1, y: y1});

    var x2 = Math.round(Math.random() * layers.Starfield.STAR_TILE_SIZE_);
    var y2 = Math.round(Math.random() * layers.Starfield.STAR_TILE_SIZE_);
    this.stars2_.push({x: x2, y: y2});
  }

  game.getPainter().registerDrawable(graphics.Layer.STARFIELD, this);
};

/**
 * @const
 * @type {!number}
 * @private
 */
layers.Starfield.STAR_DENSITY_ = 32;

/**
 * @const
 * @type {!number}
 * @private
 */
layers.Starfield.STAR_TILE_SIZE_ = 1024;

/**
 * @const
 * @type {!string}
 * @private
 */
layers.Starfield.STAR_L1_COLOR_ = 'rgb(184, 184, 184)';

/**
 * @const
 * @type {!string}
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

  var leftTile = Math.floor((x - w) / layers.Starfield.STAR_TILE_SIZE_);
  var rightTile = Math.floor((x + w) / layers.Starfield.STAR_TILE_SIZE_);
  var topTile = Math.floor((y - h) / layers.Starfield.STAR_TILE_SIZE_);
  var bottomTile = Math.floor((y + h) / layers.Starfield.STAR_TILE_SIZE_);

  context.save();

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

    leftTile = Math.floor((x - w * 1.5) / layers.Starfield.STAR_TILE_SIZE_);
    rightTile = Math.floor((x + w * 1.5) / layers.Starfield.STAR_TILE_SIZE_);
    topTile = Math.floor((y - h * 1.5) / layers.Starfield.STAR_TILE_SIZE_);
    bottomTile = Math.floor((y + h * 1.5) / layers.Starfield.STAR_TILE_SIZE_);

    context.fillStyle = layers.Starfield.STAR_L2_COLOR_;
    for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
      for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
        for (var i = 0; i < this.stars2_.length; ++i) {
          // Instead of simply stamping each tile onto the screen, make it look a little
          // more random by multiplying (modulo tile size) by the tile number. This way
          // each tile will have a unique pattern and won't look repetitive.
          var tiledX = (xTile * this.stars2_[i].x) % layers.Starfield.STAR_TILE_SIZE_;
          var tiledY = (yTile * this.stars2_[i].y) % layers.Starfield.STAR_TILE_SIZE_;

          var dx = Math.floor((xTile * layers.Starfield.STAR_TILE_SIZE_ + tiledX - x) / 3 + w / 2);
          var dy = Math.floor((yTile * layers.Starfield.STAR_TILE_SIZE_ + tiledY - y) / 3 + h / 2);
          context.fillRect(dx, dy, 1, 1);
        }
      }
    }

  context.restore();
};
