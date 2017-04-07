import Game from 'ui/Game';
import Player from 'model/player/Player';
import Range from 'math/Range';
import Vector from 'math/Vector';

export default class Viewport {
  // Maximum number of pixels the viewport can be offset by during jitter.
  private static readonly MAX_JITTER_MAGNITUDE_ = 8;

  private x_ : number;
  private y_ : number;
  private context_ : CanvasRenderingContext2D;
  private followingPlayer_ : Player | null;
  private jitterTime_ : Range;

  constructor(game : Game, context : CanvasRenderingContext2D) {
    this.x_ = 0;
    this.y_ = 0;
    this.context_ = context;
    this.followingPlayer_ = null;
    this.jitterTime_ = new Range(0, 1, 1);
  }

  // Shakes the viewport around the local player for the amount of time specified
  // in |ticks |.
  public jitter(ticks : number) {
    this.jitterTime_ = new Range(0, ticks, 1);
    this.jitterTime_.setHigh();
  }

  public followPlayer(player : Player) {
    this.followingPlayer_ = player;
  }

  public update() {
    if (!this.followingPlayer_) {
      return;
    }

    var position = this.followingPlayer_.getPosition();
    this.x_ = Math.floor(position.x);
    this.y_ = Math.floor(position.y);

    this.jitterTime_.decrement();
  }

  public getDimensions() : any {
    var ratio = this.getHdpiRatio();
    var width = this.context_.canvas.width / ratio;
    var height = this.context_.canvas.height / ratio;

    var magnitude = this.jitterTime_.getValue() / this.jitterTime_.getHigh() * Viewport.MAX_JITTER_MAGNITUDE_;
    var x = this.x_ + Math.floor((Math.random() - 0.5) * 2 * magnitude);
    var y = this.y_ + Math.floor((Math.random() - 0.5) * 2 * magnitude);

    return {
      x: x,
      y: y,
      width: width,
      height: height,
      left: x - Math.floor(width / 2),
      right: x + Math.floor(width / 2),
      top: y - Math.floor(height / 2),
      bottom: y + Math.floor(height / 2)
    };
  }

  // Returns true if the specified |vector| is contained within the viewport.
  public contains(vector : Vector) : boolean {
    var x = vector.x;
    var y = vector.y;
    var dimensions = this.getDimensions();
    return x >= dimensions.left && x <= dimensions.right &&
      y >= dimensions.top && y <= dimensions.bottom;
  }

  public getContext() : CanvasRenderingContext2D {
    return this.context_;
  }

  // See http://www.html5rocks.com/en/tutorials/canvas/hidpi/ for an explanation
  // of this inanity.
  public getHdpiRatio() : number {
    const backingStorePixelRatio = 1;
    return window.devicePixelRatio / backingStorePixelRatio;
  }
}
