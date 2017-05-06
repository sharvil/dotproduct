import { Layer } from 'graphics/Layer';
import PlayerSprite from 'view/PlayerSprite';
import Player from 'model/player/Player';
import Game from 'ui/Game';

export default class RemotePlayerSprite extends PlayerSprite {
  constructor(game : Game, player : Player) {
    super(game, player, Layer.PLAYERS);
  }
}
