import Animation from 'graphics/Animation';
import Drawable from 'graphics/Drawable';
import Game from 'ui/Game';
import { Layer } from 'graphics/Layer';
import ModelObject from 'model/ModelObject';
import Repel from 'model/projectile/Repel';
import Viewport from 'Viewport';

export default class RepelSprite extends ModelObject implements Drawable {
  private game_ : Game;
  private repel_ : Repel;
  private animation_ : Animation;

  constructor(game : Game, repel : Repel) {
    super(game.simulation);

    this.game_ = game;
    this.repel_ = repel;
    this.animation_ = game.getResourceManager().getSpriteSheet('repel').getAnimation(0);

    game.getPainter().registerDrawable(Layer.EFFECTS, this);
  }

  public advanceTime() {
    this.animation_.update();
    if (!this.animation_.isRunning()) {
      this.invalidate();
    }
  }

  public render(viewport : Viewport) {
    let dimensions = viewport.getDimensions();
    let x = Math.floor(this.repel_.getPosition().x - dimensions.left - this.animation_.width / 2);
    let y = Math.floor(this.repel_.getPosition().y - dimensions.top - this.animation_.height / 2);

    this.animation_.render(viewport.getContext(), x, y);
  }

  protected onInvalidate_() {
    super.onInvalidate_();
    this.game_.getPainter().unregisterDrawable(Layer.EFFECTS, this);
  }
}
