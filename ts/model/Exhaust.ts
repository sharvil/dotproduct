import Animation from 'graphics/Animation';
import Entity from 'model/Entity';
import Vector from 'math/Vector';
import Game from 'ui/Game';
import Prize from 'model/Prize';
import Viewport from 'Viewport';

export default class Exhaust extends Entity {
  private image_ : Animation;
  private hack_ : number;

  constructor(game : Game, position : Vector, velocity : Vector) {
    super(game);

    this.position_ = position;
    this.velocity_ = velocity;
    this.image_ = game.getResourceManager().getSpriteSheet('exhaust').getAnimation(0);

    /**
     * This variable is a tick counter. When it reaches 2, it's reset to 0
     * and the rest of the update routine is performed. It's used to both
     * slow down the animation and synchronize the exhaust animation frame
     * with distance traveled.
     *
     * @type {number}
     * @private
     */
    this.hack_ = 0;
  }

  public advanceTime() {
    if (++this.hack_ % 2) {
      return;
    }
    this.image_.update();
    this.position_ = this.position_.add(this.velocity_);
    this.velocity_ = this.velocity_.scale(0.75);
    this.hack_ = 0;

    if (!this.image_.isRunning()) {
      this.invalidate();
    }
  }

  public render(viewport : Viewport) {
    let context = viewport.getContext();
    let dimensions = viewport.getDimensions();
    let x = Math.floor(this.position_.x - dimensions.left - this.image_.getWidth() / 2);
    let y = Math.floor(this.position_.y - dimensions.top - this.image_.getHeight() / 2);

    this.image_.render(context, x, y);
  }

  public onPrizeCollected(prize : Prize | null) {}
}
