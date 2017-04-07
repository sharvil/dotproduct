import Image from 'graphics/Image';

export default class Animation {
  private image_ : Image;
  private begin_ : number;
  private end_ : number;
  private currentFrame_ : number;
  private repeatCount_ : number;
  private period_ : number;
  private counter_ : number;

  constructor(image : Image, startFrame : number, frameCount : number, period : number) {
    assert(startFrame < image.getNumTiles(), 'Invalid starting frame for animation.');
    assert(startFrame + frameCount <= image.getNumTiles(), 'Animation length out of bounds.');

    this.image_ = image;
    this.begin_ = startFrame;
    this.end_ = startFrame + frameCount;
    this.currentFrame_ = startFrame;
    this.repeatCount_ = 0;
    this.period_ = period;
    this.counter_ = this.period_;
  }

  public setRepeatCount(repeatCount : number) {
    this.repeatCount_ = repeatCount;
  }

  public isRunning() : boolean {
    return this.currentFrame_ < this.end_;
  }

  public getWidth() : number {
    return this.image_.getTileWidth();
  }

  public getHeight() : number {
    return this.image_.getTileHeight();
  }

  public update() {
    if (this.isRunning()) {
      if (!--this.counter_) {
        ++this.currentFrame_;
        this.counter_ = this.period_;
      }
    }

    if (!this.isRunning() && this.repeatCount_) {
      this.currentFrame_ = this.begin_;
      --this.repeatCount_;
    }
  }

  public render(context: CanvasRenderingContext2D, x: number, y: number) {
    if (this.isRunning()) {
      this.image_.render(context, x, y, this.currentFrame_);
    }
  }
}
