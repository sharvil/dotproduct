import Animation from 'graphics/Animation';
import Image from 'graphics/Image';

export default class SpriteSheet {
  private numAnimations_ : number;
  private framesPerAnimation_ : number;
  private period_ : number;
  private image_ : Image;

  constructor(tilesPerRow : number, tilesPerCol : number, framesPerAnimation : number, period : number) {
    assert(tilesPerRow * tilesPerCol % framesPerAnimation == 0, 'Invalid animation parameters.');

    this.numAnimations_ = tilesPerRow * tilesPerCol / framesPerAnimation;
    this.framesPerAnimation_ = framesPerAnimation;
    this.period_ = period || 1;
    this.image_ = new Image(tilesPerRow, tilesPerCol);
  }

  public isLoaded() : boolean {
    return this.image_.isLoaded();
  }

  public load(resourceName : string, loadCb? : (resourceName : string) => void) {
    this.image_.load(resourceName, loadCb);
  }

  public getNumAnimations() : number {
    return this.numAnimations_;
  }

  public getAnimation(index : number) : Animation {
    assert(index >= 0, 'Negative index specified.');
    assert(index < this.getNumAnimations(), 'Index out of bounds: ' + index);
    assert(this.isLoaded(), 'Animation requested before loading finished.');

    return new Animation(this.image_, index * this.framesPerAnimation_, this.framesPerAnimation_, this.period_);
  }
}
