import Game from 'ui/Game';
import Player from 'model/player/Player';
import LocalPlayer from 'model/player/LocalPlayer';
import RemotePlayer from 'model/player/RemotePlayer';
import Vector from 'math/Vector';
import Bullet from 'model/projectile/Bullet';
import Bomb from 'model/projectile/Bomb';
import Burst from 'model/projectile/Burst';
import Decoy from 'model/projectile/Decoy';
import Repel from 'model/projectile/Repel';

interface ModelObjectFactory {
  newLocalPlayer(game : Game, id : string, name : string, team : number, ship : number) : LocalPlayer;
  newRemotePlayer(game : Game, id : string, name : string, team : number, isAlie : boolean, ship : number, bounty : number) : RemotePlayer;
  newBullet(game : Game, owner : Player, level : number, position : Vector, velocity : Vector, lifetime : number, damage : number, bounceCount : number) : Bullet;
  newBomb(game : Game, owner : Player, level : number, position : Vector, velocity : Vector, lifetime : number, damage : number, bounceCount : number, blastRadius : number, proxRadius : number) : Bomb;
  newBurst(game : Game, owner : Player, position : Vector, velocity : Vector, lifetime : number, damage : number) : Burst;
  newDecoy(game : Game, player : Player, position : Vector, velocity : Vector, lifetime : number) : Decoy;
  newRepel(game : Game, player : Player, position : Vector, lifetime : number, distance : number, speed : number) : Repel;
}

export default ModelObjectFactory;
