import ModelObjectFactory from 'model/ModelObjectFactory';
import LocalPlayer from 'model/player/LocalPlayer';
import LocalPlayerSprite from 'view/LocalPlayerSprite';
import RemotePlayer from 'model/player/RemotePlayer';
import RemotePlayerSprite from 'view/RemotePlayerSprite';
import Player from 'model/player/Player';
import Bomb from 'model/projectile/Bomb';
import BombSprite from 'view/BombSprite';
import Bullet from 'model/projectile/Bullet';
import BulletSprite from 'view/BulletSprite';
import Burst from 'model/projectile/Burst';
import BurstSprite from 'view/BurstSprite';
import Decoy from 'model/projectile/Decoy';
import DecoySprite from 'view/DecoySprite';
import Repel from 'model/projectile/Repel';
import RepelSprite from 'view/RepelSprite';
import Game from 'ui/Game';
import Simulation from 'model/Simulation';
import Vector from 'math/Vector';

export default class GraphicalModelObjectFactory implements ModelObjectFactory {
  private game_ : Game;

  constructor(game : Game) {
    this.game_ = game;
  }

  public newLocalPlayer(simulation : Simulation, id : string, name : string, team : number, ship : number) : LocalPlayer {
    let player = new LocalPlayer(simulation, this.game_.getKeyboard(), id, name, team, ship);
    let sprite = new LocalPlayerSprite(this.game_, player);

    return player;
  }

  public newRemotePlayer(id : string, name : string, team : number, isAlive : boolean, ship : number, bounty : number) : RemotePlayer {
    let player = new RemotePlayer(this.game_.simulation, id, name, team, isAlive, ship, bounty);
    let sprite = new RemotePlayerSprite(this.game_, player);

    return player;
  }

  public newBullet(owner : Player, level : number, position : Vector, velocity : Vector, lifetime : number, damage : number, bounceCount : number) : Bullet {
    let projectile = new Bullet(this.game_.simulation, owner, level, position, velocity, lifetime, damage, bounceCount);
    let sprite = new BulletSprite(this.game_, projectile);

    return projectile;
  }

  public newBomb(owner : Player, level : number, position : Vector, velocity : Vector, lifetime : number, damage : number, bounceCount : number, blastRadius : number, proxRadius : number) : Bomb {
    let projectile = new Bomb(this.game_.simulation, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
    let sprite = new BombSprite(this.game_, projectile);

    return projectile;
  }

  public newBurst(owner : Player, position : Vector, velocity : Vector, lifetime : number, damage : number) : Burst {
    let projectile = new Burst(this.game_.simulation, owner, position, velocity, lifetime, damage);
    let sprite = new BurstSprite(this.game_, projectile);

    return projectile;
  }

  public newDecoy(owner : Player, position : Vector, velocity : Vector, lifetime : number) : Decoy {
    let projectile = new Decoy(this.game_.simulation, owner, position, velocity, lifetime);
    let sprite = new DecoySprite(this.game_, projectile);

    return projectile;
  }

  public newRepel(owner : Player, position : Vector, lifetime : number, distance : number, speed : number) : Repel {
    let projectile = new Repel(this.game_.simulation, owner, position, lifetime, distance, speed);
    let sprite = new RepelSprite(this.game_, projectile);

    return projectile;
  }
}
