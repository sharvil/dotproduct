import ModelObject from 'model/ModelObject';
import Bomb from 'model/projectile/Bomb';
import Projectile from 'model/projectile/Projectile';
import Vector from 'math/Vector';
import Effect from 'view/Effect';
import { Layer } from 'graphics/Layer';
import Labs from 'Labs';
import Game from 'ui/Game';
import Animation from 'graphics/Animation';
import Player from 'model/player/Player';
import Drawable from 'graphics/Drawable';
import Listener from 'Listener';
import Viewport from 'Viewport';

export default class BombSprite extends ModelObject implements Drawable {
  private game_ : Game;
  private bomb_: Bomb;
  private animation_ : Animation;
  private bouncingAnimation_ : Animation;

  constructor(game : Game, bomb : Bomb) {
    super(game.simulation);

    let level = bomb.getLevel();

    this.game_ = game;
    this.bomb_ = bomb;
    this.animation_ = game.getResourceManager().getSpriteSheet((bomb.isMine()) ? 'mines' : 'bombs').getAnimation(level);
    this.animation_.setRepeatCount(-1);
    this.bouncingAnimation_ = game.getResourceManager().getSpriteSheet('bombs').getAnimation(level + 8);
    this.bouncingAnimation_.setRepeatCount(-1);

    Listener.add(this.bomb_, 'explode', this.onExplode_.bind(this));
    Listener.add(this.bomb_, 'explode_jitter', this.onJitter_.bind(this));

    game.getPainter().registerDrawable(Layer.PROJECTILES, this);
  }

  public advanceTime() {
    // First advance and drop the trail.
    if (!this.bomb_.isMine() && Labs.BOMB_TRAILS) {
      let animation = this.game_.getResourceManager().getSpriteSheet('bombTrails').getAnimation(this.bomb_.getLevel());
      new Effect(this.game_, animation, this.bomb_.getPosition(), Vector.ZERO, Layer.TRAILS);
    }

    this.animation_.update();
    this.bouncingAnimation_.update();
  }

  public render(viewport : Viewport) {
    if (!this.bomb_.isValid()) {
      this.invalidate();
      return;
    }

    let dimensions = viewport.getDimensions();
    let x = Math.floor(this.bomb_.getPosition().x - dimensions.left - this.animation_.width / 2);
    let y = Math.floor(this.bomb_.getPosition().y - dimensions.top - this.animation_.height / 2);

    if (!this.bomb_.isMine() && this.bomb_.isBouncing()) {
      this.bouncingAnimation_.render(viewport.getContext(), x, y);
    } else {
      this.animation_.render(viewport.getContext(), x, y);
    }
  }

  private onExplode_(projectile : Projectile, hitPlayer : Player | null) {
    let animation = this.game_.getResourceManager().getSpriteSheet('explode2').getAnimation(0);
    new Effect(this.game_, animation, this.bomb_.getPosition(), Vector.ZERO);

    let viewport = this.game_.getViewport();
    if (viewport.contains(this.bomb_.getPosition())) {
      this.game_.getResourceManager().playSound('explodeBomb');
    }
  }

  private onJitter_() {
    // TODO: get jitter ticks from settings.
    this.game_.getViewport().jitter(72);
  }

  protected onInvalidate_() {
    super.onInvalidate_();
    this.game_.getPainter().unregisterDrawable(Layer.PROJECTILES, this);
  }
}
