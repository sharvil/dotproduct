import ModelObjectFactory from 'model/ModelObjectFactory';
import LocalPlayer from 'model/player/LocalPlayer';
import RemotePlayer from 'model/player/RemotePlayer';
import Player from 'model/player/Player';
import Bomb from 'model/projectile/Bomb';
import Bullet from 'model/projectile/Bullet';
import Burst from 'model/projectile/Burst';
import Decoy from 'model/projectile/Decoy';
import Repel from 'model/projectile/Repel';
import Game from 'ui/Game';
import Simulation from 'model/Simulation';
import Vector from 'math/Vector';

export default class HeadlessModelObjectFactory implements ModelObjectFactory {
  private game_ : Game;

  constructor(game : Game) {
    this.game_ = game;
  }

  public newLocalPlayer(simulation : Simulation, id : string, name : string, team : number, ship : number) : LocalPlayer {
    return new LocalPlayer(simulation, this.game_.getKeyboard(), id, name, team, ship);
  }

  public newRemotePlayer(id : string, name : string, team : number, isAlive : boolean, ship : number, bounty : number) : RemotePlayer {
    return new RemotePlayer(this.game_.simulation, id, name, team, isAlive, ship, bounty);
  }

  public newBullet(owner : Player, level : number, position : Vector, velocity : Vector, lifetime : number, damage : number, bounceCount : number) : Bullet {
    return new Bullet(this.game_.simulation, owner, level, position, velocity, lifetime, damage, bounceCount);
  }

  public newBomb(owner : Player, level : number, position : Vector, velocity : Vector, lifetime : number, damage : number, bounceCount : number, blastRadius : number, proxRadius : number) : Bomb {
    return new Bomb(this.game_.simulation, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
  }

  public newBurst(owner : Player, position : Vector, velocity : Vector, lifetime : number, damage : number) : Burst {
    return new Burst(this.game_.simulation, owner, position, velocity, lifetime, damage);
  }

  public newDecoy(owner : Player, position : Vector, velocity : Vector, lifetime : number) : Decoy {
    return new Decoy(this.game_.simulation, owner, position, velocity, lifetime);
  }

  public newRepel(owner : Player, position : Vector, lifetime : number, distance : number, speed : number) : Repel {
    return new Repel(this.game_.simulation, owner, position, lifetime, distance, speed);
  }
}
