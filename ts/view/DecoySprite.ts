import ModelObject from 'model/ModelObject';
import Game from 'ui/Game';
import Decoy from 'model/projectile/Decoy';
import Drawable from 'graphics/Drawable';
import { Layer } from 'graphics/Layer';
import Viewport from 'Viewport';
import PlayerSprite from 'view/PlayerSprite';

export default class DecoySprite extends ModelObject implements Drawable {
  private game_ : Game;
  private decoy_ : Decoy;

  constructor(game : Game, decoy : Decoy) {
    super(game.simulation);

    this.game_ = game;
    this.decoy_ = decoy;

    game.getPainter().registerDrawable(Layer.PROJECTILES, this);
  }

  public render(viewport : Viewport) {
    if (!this.decoy_.isValid()) {
      this.game_.getPainter().unregisterDrawable(Layer.PROJECTILES, this);
      return;
    }

    PlayerSprite.renderPlayer(this.game_, viewport, this.decoy_.getOwner(), this.decoy_.getDirection(), this.decoy_.getPosition());
  }

  public advanceTime() {}
}
