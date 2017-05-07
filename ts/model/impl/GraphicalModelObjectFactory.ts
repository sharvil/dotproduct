import ModelObjectFactory from 'model/ModelObjectFactory';
import LocalPlayer from 'model/player/LocalPlayer';
import LocalPlayerSprite from 'view/LocalPlayerSprite';
import RemotePlayer from 'model/player/RemotePlayer';
import RemotePlayerSprite from 'view/RemotePlayerSprite';
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

export default class GraphicalModelObjectFactory implements ModelObjectFactory {
  private game_ : Game;

  constructor(game : Game) {
    this.game_ = game;
  }

  public newLocalPlayer = function (simulation, id, name, team, ship) {
    let player = new LocalPlayer(this.game_, simulation, id, name, team, ship);
    let sprite = new LocalPlayerSprite(this.game_, player);

    return player;
  }

  public newRemotePlayer = function (id, name, team, isAlive, ship, bounty) {
    let player = new RemotePlayer(this.game_.simulation, id, name, team, isAlive, ship, bounty);
    let sprite = new RemotePlayerSprite(this.game_, player);

    return player;
  }

  public newBullet = function (owner, level, position, velocity, lifetime, damage, bounceCount) {
    let projectile = new Bullet(this.game_.simulation, owner, level, position, velocity, lifetime, damage, bounceCount);
    let sprite = new BulletSprite(this.game_, projectile);

    return projectile;
  }

  public newBomb = function (owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
    let projectile = new Bomb(this.game_.simulation, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
    let sprite = new BombSprite(this.game_, projectile);

    return projectile;
  }

  public newBurst = function (owner, position, velocity, lifetime, damage) {
    let projectile = new Burst(this.game_.simulation, owner, position, velocity, lifetime, damage);
    let sprite = new BurstSprite(this.game_, projectile);

    return projectile;
  }

  public newDecoy = function (owner, position, velocity, lifetime) {
    let projectile = new Decoy(this.game_.simulation, owner, position, velocity, lifetime);
    let sprite = new DecoySprite(this.game_, projectile);

    return projectile;
  }

  public newRepel = function (owner, position, lifetime, distance, speed) {
    let projectile = new Repel(this.game_.simulation, owner, position, lifetime, distance, speed);
    let sprite = new RepelSprite(this.game_, projectile);

    return projectile;
  }
}
