import Vector from 'math/Vector';
import Effect from 'model/Effect';
import Projectile from 'model/projectile/Projectile';
import { Layer } from 'graphics/Layer';
import Drawable from 'graphics/Drawable';
import Bullet from 'model/projectile/Projectile';
import ModelObject from 'model/ModelObject';
import Game from 'ui/Game';
import Listener from 'Listener';
import Animation from 'graphics/Animation';
import Viewport from 'Viewport';
import Labs from 'Labs';
import Player from 'model/player/Player';

export default class BulletSprite extends ModelObject implements Drawable {
  private game_: Game;
  private bullet_ : Bullet;
  private animation_ : Animation;
  private bouncingAnimation_ : Animation;

  constructor(game : Game, bullet : Bullet) {
    super(game.simulation);

    let level = bullet.getLevel();

    this.game_ = game;
    this.bullet_ = bullet;
    this.animation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(level);
    this.animation_.setRepeatCount(-1);
    this.bouncingAnimation_ = game.getResourceManager().getSpriteSheet('bullets').getAnimation(5 + level);
    this.bouncingAnimation_.setRepeatCount(-1);

    Listener.add(this.bullet_, 'explode', this.onExplode_.bind(this));
    game.getPainter().registerDrawable(Layer.PROJECTILES, this);
  }

  public advanceTime() {
    this.animation_.update();
    this.bouncingAnimation_.update();
  }

  public render(viewport : Viewport) {
    if (!this.bullet_.isValid()) {
      this.invalidate();
      return;
    }

    if (Labs.BULLET_TRAILS) {
      let animation = this.game_.getResourceManager().getSpriteSheet('bulletTrails').getAnimation(3 + this.bullet_.getLevel());
      new Effect(this.game_, animation, this.bullet_.getPosition(), Vector.ZERO, Layer.TRAILS);
    }

    let dimensions = viewport.getDimensions();
    let x = Math.floor(this.bullet_.getPosition().x - dimensions.left - this.animation_.width / 2);
    let y = Math.floor(this.bullet_.getPosition().y - dimensions.top - this.animation_.height / 2);
    let animation = this.bullet_.isBouncing() ? this.bouncingAnimation_ : this.animation_;

    animation.render(viewport.getContext(), x, y);
  }

  /** This function gets called when a bullet explodes and hits a player. */
  private onExplode_(projectile : Projectile, hitPlayer : Player | null) {
    let animation = this.game_.getResourceManager().getSpriteSheet('explode0').getAnimation(0);
    new Effect(this.game_, animation, this.bullet_.getPosition(), Vector.ZERO);

    let viewport = this.game_.getViewport();
    if (viewport.contains(this.bullet_.getPosition())) {
      this.game_.getResourceManager().playSound('explodeBullet');
    }
  }

  protected onInvalidate_() {
    super.onInvalidate_();
    this.game_.getPainter().unregisterDrawable(Layer.PROJECTILES, this);
  }
}
