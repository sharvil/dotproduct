import Drawable from 'graphics/Drawable';
import { Layer } from 'graphics/Layer';
import Prng from 'math/Prng';
import Viewport from 'Viewport';
import Game from 'ui/Game';

export default class Starfield implements Drawable {
  private static readonly NUM_LARGE_STARS_ = 256;
  private static readonly STAR_DENSITY_ = 32;
  private static readonly STAR_TILE_SIZE_ = 1024;
  private static readonly STAR_L1_COLOR_ = 'rgb(184, 184, 184)';
  private static readonly STAR_L2_COLOR_ = 'rgb(96, 96, 96)';

  private game_ : Game;
  private bigStars_ : Array<{ asset: string, x: number, y: number}>;
  private stars_ : Array<{ x: number, y: number}>;

  constructor(game : Game) {
    this.game_ = game;

    this.bigStars_ = [];
    this.stars_ = [];

    // TODO(sharvil): seed this PRNG with something map-unique so
    // we get a map-specific stable, random star pattern.
    var rng = new Prng();
    var map = game.getMap();
    var mapWidth = map.getTileWidth() * map.getWidth();
    var mapHeight = map.getTileHeight() * map.getHeight();
    for (var i = 0; i < Starfield.NUM_LARGE_STARS_; ++i) {
      let star = {
        asset: 'star' + (rng.random() % 6),
        x: rng.random() % mapWidth,
        y: rng.random() % mapHeight
      };
      this.bigStars_.push(star);
    }

    for (var i = 0; i < Starfield.STAR_DENSITY_; ++i) {
      let star = {
        x: Math.round(Math.random() * Starfield.STAR_TILE_SIZE_),
        y: Math.round(Math.random() * Starfield.STAR_TILE_SIZE_)
      };
      this.stars_.push(star);
    }

    game.getPainter().registerDrawable(Layer.STARFIELD, this);
  }

  public render(viewport : Viewport) {
    var context = viewport.getContext();
    var dimensions = viewport.getDimensions();
    var x = dimensions.x;
    var y = dimensions.y;
    var w = dimensions.width;
    var h = dimensions.height;

    context.save();

    var leftTile = Math.floor((x - w * 1.5) / Starfield.STAR_TILE_SIZE_);
    var rightTile = Math.floor((x + w * 1.5) / Starfield.STAR_TILE_SIZE_);
    var topTile = Math.floor((y - h * 1.5) / Starfield.STAR_TILE_SIZE_);
    var bottomTile = Math.floor((y + h * 1.5) / Starfield.STAR_TILE_SIZE_);

    context.fillStyle = Starfield.STAR_L2_COLOR_;
    for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
      for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
        for (var i = 0; i < this.stars_.length; ++i) {
          // Instead of simply stamping each tile onto the screen, make it look a little
          // more random by multiplying (modulo tile size) by the tile number. This way
          // each tile will have a unique pattern and won't look repetitive. Multiply by
          // another 31 to make this star pattern look different than the equivalent for
          // the L1 stars.
          var tiledX = (31 * xTile * this.stars_[i].x) % Starfield.STAR_TILE_SIZE_;
          var tiledY = (31 * yTile * this.stars_[i].y) % Starfield.STAR_TILE_SIZE_;

          var dx = Math.floor((xTile * Starfield.STAR_TILE_SIZE_ + tiledX - x) / 3 + w / 2);
          var dy = Math.floor((yTile * Starfield.STAR_TILE_SIZE_ + tiledY - y) / 3 + h / 2);
          context.fillRect(dx, dy, 1, 1);
        }
      }
    }

    leftTile = Math.floor((x - w) / Starfield.STAR_TILE_SIZE_);
    rightTile = Math.floor((x + w) / Starfield.STAR_TILE_SIZE_);
    topTile = Math.floor((y - h) / Starfield.STAR_TILE_SIZE_);
    bottomTile = Math.floor((y + h) / Starfield.STAR_TILE_SIZE_);

    context.fillStyle = Starfield.STAR_L1_COLOR_;
    for (var yTile = topTile; yTile <= bottomTile; ++yTile) {
      for (var xTile = leftTile; xTile <= rightTile; ++xTile) {
        for (var i = 0; i < this.stars_.length; ++i) {
          // Instead of simply stamping each tile onto the screen, make it look a little
          // more random by multiplying (modulo tile size) by the tile number. This way
          // each tile will have a unique pattern and won't look repetitive.
          var tiledX = (xTile * this.stars_[i].x) % Starfield.STAR_TILE_SIZE_;
          var tiledY = (yTile * this.stars_[i].y) % Starfield.STAR_TILE_SIZE_;

          var dx = Math.floor((xTile * Starfield.STAR_TILE_SIZE_ + tiledX - x + w) / 2);
          var dy = Math.floor((yTile * Starfield.STAR_TILE_SIZE_ + tiledY - y + h) / 2);
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
  }
}
