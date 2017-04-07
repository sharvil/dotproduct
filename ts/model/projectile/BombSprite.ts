import ModelObject from 'model/ModelObject';
import Bomb from 'model/projectile/Bomb';
import Projectile from 'model/projectile/Projectile';
import Vector from 'math/Vector';
import Effect from 'model/Effect';
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
    super(game.getSimulation());

    var level = bomb.getLevel();

    this.game_ = game;
    this.bomb_ = bomb;
    this.animation_ = game.getResourceManager().getSpriteSheet((bomb.isMine()) ? 'mines' : 'bombs').getAnimation(level);
    this.animation_.setRepeatCount(-1);
    this.bouncingAnimation_ = game.getResourceManager().getSpriteSheet('bombs').getAnimation(level + 8);
    this.bouncingAnimation_.setRepeatCount(-1);

    Listener.add(this.bomb_, 'explode', this.onExplode_.bind(this));

    game.getPainter().registerDrawable(Layer.PROJECTILES, this);
  }

  public advanceTime() {
    // First advance and drop the trail.
    if (!this.bomb_.isMine() && Labs.BOMB_TRAILS) {
      var animation = this.game_.getResourceManager().getSpriteSheet('bombTrails').getAnimation(this.bomb_.getLevel());
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

    var dimensions = viewport.getDimensions();
    var x = Math.floor(this.bomb_.getPosition().x - dimensions.left - this.animation_.getWidth() / 2);
    var y = Math.floor(this.bomb_.getPosition().y - dimensions.top - this.animation_.getHeight() / 2);

    if (!this.bomb_.isMine() && this.bomb_.isBouncing()) {
      this.bouncingAnimation_.render(viewport.getContext(), x, y);
    } else {
      this.animation_.render(viewport.getContext(), x, y);
    }
  }

  private onExplode_(projectile : Projectile, hitPlayer : Player | null) {
    var animation = this.game_.getResourceManager().getSpriteSheet('explode2').getAnimation(0);
    new Effect(this.game_, animation, this.bomb_.getPosition(), Vector.ZERO);
  }

  protected onInvalidate_() {
    super.onInvalidate_();
    this.game_.getPainter().unregisterDrawable(Layer.PROJECTILES, this);
  }
}
