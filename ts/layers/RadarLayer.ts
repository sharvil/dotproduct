import Drawable from 'graphics/Drawable';
import { Layer } from 'graphics/Layer';
import Rect from 'math/Rect';
import ModelObject from 'model/ModelObject';
import LocalPlayer from 'model/player/LocalPlayer';
import Player from 'model/player/Player';
import Palette from 'Palette';
import Game from 'ui/Game';
import Viewport from 'Viewport';

export default class RadarLayer extends ModelObject implements Drawable {
  private static readonly SCALE_FACTOR_ = 0.12;
  private static readonly RADAR_SIZE_PERCENT_ = 0.3;
  private static readonly BLINK_DELTA_ = 0.03;

  private game_ : Game;
  private tileWidth_ : number;
  private tileHeight_ : number;
  private mapCanvas_ : HTMLCanvasElement | null;
  private blinkDirection_ : number;
  private blinkAlpha_ : number;

  constructor(game : Game) {
    super(game.getSimulation());

    this.game_ = game;
    this.tileWidth_ = this.game_.getResourceManager().getImage('tileset').tileWidth;
    this.tileHeight_ = this.game_.getResourceManager().getImage('tileset').tileHeight;
    this.mapCanvas_ = null;
    this.blinkDirection_ = -1;
    this.blinkAlpha_ = 1;

    game.getPainter().registerDrawable(Layer.HUD, this);
  }

  public static sizeForViewport(viewport : Viewport) : { width: number, height: number} {
    let viewportDimensions = viewport.getDimensions();
    let size = Math.floor(Math.min(viewportDimensions.width, viewportDimensions.height) * RadarLayer.RADAR_SIZE_PERCENT_);
    return {
      width: size,
      height: size
    }
  }

  public advanceTime() {
    this.blinkAlpha_ += this.blinkDirection_ * RadarLayer.BLINK_DELTA_;
    if (this.blinkAlpha_ >= 1) {
      this.blinkDirection_ = -1;
      this.blinkAlpha_ = 1;
    } else if (this.blinkAlpha_ <= 0) {
      this.blinkDirection_ = 1;
      this.blinkAlpha_ = 0;
    }
  }

  public render(viewport : Viewport) {
    let context = viewport.getContext();
    let dimensions = viewport.getDimensions();

    let size = RadarLayer.sizeForViewport(viewport);

    context.save();
    let left = dimensions.width - size.width;
    let top = dimensions.height - size.height;
    context.translate(left, top);

    // Render border. The Canvas API is retarded with strokes -- apparently it draws
    // half a pixel *around* the stroke path so we have to offset coordinates by 0.5px.
    context.strokeStyle = Palette.borderColor();
    context.strokeRect(-0.5, -0.5, size.width, size.height);

    // Set clipping region
    context.beginPath();
    context.rect(0, 0, size.width, size.height);
    context.clip();

    // Draw radar background
    context.fillStyle = Palette.radarBgColor();
    context.fillRect(0, 0, size.width, size.height);

    this.renderMap_(context, dimensions, size.width, size.height);
    this.renderPrizes_(context, dimensions, size.width, size.height);
    this.renderPlayers_(context, dimensions, size.width, size.height);
    context.restore();
  }

  private renderMap_(context : CanvasRenderingContext2D, dimensions : any, radarWidth : number, radarHeight : number) {
    if (!this.mapCanvas_) {
      this.prerenderMapOnCanvas_();
      if (!this.mapCanvas_) {
        return;
      }
    }

    let SCALE_FACTOR = RadarLayer.SCALE_FACTOR_;

    let tileWidth = this.tileWidth_;
    let tileHeight = this.tileHeight_;
    let scaledTileWidth = Math.floor(tileWidth * SCALE_FACTOR) || 1;
    let scaledTileHeight = Math.floor(tileHeight * SCALE_FACTOR) || 1;

    let sourceX = Math.floor((dimensions.x * scaledTileWidth / tileWidth) - (radarWidth / 2));
    let sourceY = Math.floor((dimensions.y * scaledTileHeight / tileHeight) - (radarHeight / 2));
    let destX = 0;
    let destY = 0;

    // Make sure all source dimensions fall within the source image. If they don't, the drawImage
    // will fail.
    if (sourceX < 0) {
      destX = -sourceX;
      sourceX = 0;
    } else if (sourceX + radarWidth > this.mapCanvas_.width) {
      radarWidth = this.mapCanvas_.width - sourceX;
    }

    if (sourceY < 0) {
      destY = -sourceY;
      sourceY = 0;
    } else if (sourceY + radarHeight > this.mapCanvas_.height) {
      radarHeight = this.mapCanvas_.height - sourceY;
    }

    context.drawImage(this.mapCanvas_, sourceX, sourceY, radarWidth, radarHeight, destX, destY, radarWidth, radarHeight);
  }

  private renderPrizes_(context : CanvasRenderingContext2D, dimensions : any, radarWidth : number, radarHeight : number) {
    let SCALE_FACTOR = RadarLayer.SCALE_FACTOR_;

    let tileWidth = this.tileWidth_;
    let tileHeight = this.tileHeight_;
    let scaledTileWidth = Math.floor(tileWidth * SCALE_FACTOR) || 1;
    let scaledTileHeight = Math.floor(tileHeight * SCALE_FACTOR) || 1;

    context.fillStyle = Palette.radarPrizeColor();
    this.game_.getPrizeList().forEach(function (prize) {
      let xPixels = (prize.getX() - dimensions.x / tileWidth) * scaledTileWidth;
      let yPixels = (prize.getY() - dimensions.y / tileHeight) * scaledTileHeight;
      let x = Math.floor(xPixels + radarWidth / 2);
      let y = Math.floor(yPixels + radarHeight / 2);

      context.fillRect(x, y, scaledTileWidth, scaledTileHeight);
    });
  }

  private renderPlayers_(context : CanvasRenderingContext2D, dimensions : any, radarWidth : number, radarHeight : number) {
    let self = this;
    let localPlayer = this.game_.getPlayerList().localPlayer;

    let SCALE_FACTOR = RadarLayer.SCALE_FACTOR_;
    let actualXScale = (Math.floor(this.tileWidth_ * SCALE_FACTOR) || 1) / this.tileWidth_;
    let actualYScale = (Math.floor(this.tileHeight_ * SCALE_FACTOR) || 1) / this.tileHeight_;

    this.game_.getPlayerList().forEach(function (player) {
      if (!player.isAlive) {
        return;
      }

      let position = player.getPosition();
      let xPixels = Math.floor(position.x * actualXScale) - (dimensions.x * actualXScale);
      let yPixels = Math.floor(position.y * actualYScale) - (dimensions.y * actualYScale);
      let x = Math.floor(xPixels + radarWidth / 2);
      let y = Math.floor(yPixels + radarHeight / 2);
      let alpha = (player == localPlayer) ? self.blinkAlpha_ : 1;

      context.fillStyle = player.isFriend(localPlayer) ? Palette.friendColor(alpha) : Palette.foeColor();
      context.fillRect(x - 1, y - 1, 3, 3);
    });
  }

  private prerenderMapOnCanvas_() {
    let SCALE_FACTOR = RadarLayer.SCALE_FACTOR_;
    let map = this.game_.getMap();
    let tileWidth = this.tileWidth_;
    let tileHeight = this.tileHeight_;
    let scaledTileWidth = Math.floor(tileWidth * SCALE_FACTOR) || 1;
    let scaledTileHeight = Math.floor(tileHeight * SCALE_FACTOR) || 1;

    this.mapCanvas_ = document.createElement('canvas');
    this.mapCanvas_.width = Math.ceil(map.getWidth() * scaledTileWidth);
    this.mapCanvas_.height = Math.ceil(map.getHeight() * scaledTileHeight);

    let context = this.mapCanvas_.getContext('2d');
    let tiles = map.getTiles(Rect.fromBox(0, 0, map.getWidth() - 1, map.getHeight() - 1));

    if (!context) {
      this.mapCanvas_ = null;
      return;
    }

    context.fillStyle = Palette.radarTileColor();
    for (let i = 0; i < tiles.length; ++i) {
      let tile = tiles[i];
      let x = tile.x * scaledTileWidth;
      let y = tile.y * scaledTileHeight;

      context.fillRect(x, y, scaledTileWidth, scaledTileHeight);
    }
  }

  protected onInvalidate_() {
    assert(false, 'Radar layer should never be invalidated.');
  }
}
