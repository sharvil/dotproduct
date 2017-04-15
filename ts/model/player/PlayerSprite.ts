import Drawable from 'graphics/Drawable';
import { Layer } from 'graphics/Layer';
import Effect from 'model/Effect';
import Vector from 'math/Vector';
import Player from 'model/player/Player';
import Game from 'ui/Game';
import Viewport from 'Viewport';
import Listener from 'Listener';
import Image from 'graphics/Image';
import Palette from 'Palette';
import Font from 'Font';

export default class PlayerSprite implements Drawable {
  protected game_ : Game;
  protected player_ : Player;
  protected layer_ : Layer;
  constructor(game : Game, player : Player, layer : Layer) {
    this.game_ = game;
    this.player_ = player;
    this.layer_ = layer;

    Listener.add(player, 'death', this.death_.bind(this));
    Listener.add(player, 'respawn', this.respawn_.bind(this));

    game.getPainter().registerDrawable(layer, this);
  }

  public render(viewport : Viewport) {
    if (!this.player_.isValid()) {
      this.game_.getPainter().unregisterDrawable(this.layer_, this);
      return;
    }

    if (!this.player_.isAlive()) {
      return;
    }

    PlayerSprite.renderPlayer(this.game_, viewport, this.player_, this.player_.getDirection(), this.player_.getPosition());
  }

  /**
   * This function renders the given |player| with an override for |direction| and
   * |position|. It's used to share player rendering code between PlayerSprite
   * and DecoySprite.
   */
  public static renderPlayer(game : Game, viewport : Viewport, player : Player, direction : number, position : Vector) {
    let resourceManager = game.getResourceManager();
    let shipImage = resourceManager.getImage('ship' + player.getShip());

    let dimensions = viewport.getDimensions();
    let context = viewport.getContext();

    let x = Math.floor(position.x - dimensions.left - shipImage.getTileWidth() / 2);
    let y = Math.floor(position.y - dimensions.top - shipImage.getTileHeight() / 2);

    shipImage.render(context, x, y, direction);

    // Draw a label for the player's name.
    let name = player.getName();
    let bounty = player.getBounty();
    let isFriend = player.isFriend(game.getPlayerIndex().getLocalPlayer());
    context.save();
    context.font = Font.playerFont().toString();
    context.fillStyle = isFriend ? Palette.friendColor() : Palette.foeColor();
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(name + '(' + bounty + ')', x + shipImage.getTileWidth() / 2, y + shipImage.getTileHeight());
    context.restore();

    // Draw a presence indicator for the player if applicable.
    let presenceImage : Image | null = null;
    if (player.hasPresence(Player.Presence.AWAY)) {
      presenceImage = resourceManager.getImage('presenceAway');
    } else if (player.hasPresence(Player.Presence.TYPING)) {
      presenceImage = resourceManager.getImage('presenceTyping');
    }

    if (presenceImage) {
      let speechX = x + shipImage.getTileWidth() - Math.floor(presenceImage.getTileWidth() / 2);
      let speechY = y - Math.floor(presenceImage.getTileHeight() / 2);
      presenceImage.render(context, speechX, speechY);
    }
  }

  /**
   * Called when the player this sprite represents gets killed.
   */
  private death_(killee : Player, killer : Player) {
    let position = killee.getPosition();
    let velocity = killee.getVelocity();

    let resourceManager = this.game_.getResourceManager();
    let ensemble = resourceManager.getSpriteSheet('explode1');
    new Effect(this.game_, ensemble.getAnimation(0), position, velocity);

    ensemble = resourceManager.getSpriteSheet('ship' + killee.getShip() + '_junk');
    for (let i = 0; i < ensemble.getNumAnimations(); ++i) {
      let animation = ensemble.getAnimation(i);
      let deltaVelocity = Vector.fromPolar(Math.random() * 2, Math.random() * 2 * Math.PI);
      new Effect(this.game_, animation, position, velocity.add(deltaVelocity));
    }

    if (this.game_.getViewport().contains(position)) {
      resourceManager.playSound('explodeShip');
    }
  }

  /** Called when the player this sprite represents respawns. */
  private respawn_(player : Player) {
    let resourceManager = this.game_.getResourceManager();
    let animation = resourceManager.getSpriteSheet('warp').getAnimation(0);
    new Effect(this.game_, animation, player.getPosition(), Vector.ZERO);
  }
}
