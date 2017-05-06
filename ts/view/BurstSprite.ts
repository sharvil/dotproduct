import Animation from 'graphics/Animation';
import Burst from 'model/projectile/Burst';
import Drawable from 'graphics/Drawable';
import Effect from 'model/Effect';
import Game from 'ui/Game';
import { Layer } from 'graphics/Layer';
import Listener from 'Listener';
import ModelObject from 'model/ModelObject';
import Player from 'model/player/Player';
import Projectile from 'model/projectile/Projectile';
import Vector from 'math/Vector';
import Viewport from 'Viewport';

export default class BurstSprite extends ModelObject implements Drawable {
  private game_ : Game;
  private burst_ : Burst;
  private activeAnimation_ : Animation;
  private inactiveAnimation_ : Animation;

  constructor(game : Game, burst : Burst) {
    super(game.getSimulation());

    this.game_ = game;
    this.burst_ = burst;
    this.activeAnimation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(9);
    this.activeAnimation_.setRepeatCount(-1);
    this.inactiveAnimation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(4);
    this.inactiveAnimation_.setRepeatCount(-1);

    Listener.add(this.burst_, 'explode', this.onExplode_.bind(this));

    game.getPainter().registerDrawable(Layer.PROJECTILES, this);
  }

  public advanceTime() {
    this.activeAnimation_.update();
    this.inactiveAnimation_.update();
  }

  public render(viewport : Viewport) {
    if (!this.burst_.isValid()) {
      this.invalidate();
      return;
    }

    let animation = this.burst_.isActive() ? this.activeAnimation_ : this.inactiveAnimation_;
    let dimensions = viewport.getDimensions();
    let x = Math.floor(this.burst_.getPosition().x - dimensions.left - animation.width / 2);
    let y = Math.floor(this.burst_.getPosition().y - dimensions.top - animation.height / 2);

    animation.render(viewport.getContext(), x, y);
  }

  protected onExplode_(projectile : Projectile, hitPlayer : Player | null) {
    // Add an explosion animation.
    let animation = this.game_.getResourceManager().getSpriteSheet('explode0').getAnimation(0);
    new Effect(this.game_, animation, this.burst_.getPosition(), Vector.ZERO);
  }

  protected onInvalidate_() {
    super.onInvalidate_();
    this.game_.getPainter().unregisterDrawable(Layer.PROJECTILES, this);
  }
}
