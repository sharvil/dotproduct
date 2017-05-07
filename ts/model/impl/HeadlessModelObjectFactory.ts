import ModelObjectFactory from 'model/ModelObjectFactory';
import LocalPlayer from 'model/player/LocalPlayer';
import RemotePlayer from 'model/player/RemotePlayer';
import Bomb from 'model/projectile/Bomb';
import Bullet from 'model/projectile/Bullet';
import Burst from 'model/projectile/Burst';
import Decoy from 'model/projectile/Decoy';
import Repel from 'model/projectile/Repel';
import Game from 'ui/Game';

export default class HeadlessModelObjectFactory implements ModelObjectFactory {
  private game_ : Game;

  constructor(game : Game) {
    this.game_ = game;
  }

  public newLocalPlayer = function (simulation, id, name, team, ship) {
    return new LocalPlayer(this.game_, simulation, id, name, team, ship);
  }

  public newRemotePlayer = function (id, name, team, isAlive, ship, bounty) {
    return new RemotePlayer(this.game_.simulation, id, name, team, isAlive, ship, bounty);
  }

  public newBullet = function (owner, level, position, velocity, lifetime, damage, bounceCount) {
    return new Bullet(this.game_.simulation, owner, level, position, velocity, lifetime, damage, bounceCount);
  }

  public newBomb = function (owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
    return new Bomb(this.game_.simulation, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
  }

  public newBurst = function (owner, position, velocity, lifetime, damage) {
    return new Burst(this.game_.simulation, owner, position, velocity, lifetime, damage);
  }

  public newDecoy = function (owner, position, velocity, lifetime) {
    return new Decoy(this.game_.simulation, owner, position, velocity, lifetime);
  }

  public newRepel = function (owner, position, lifetime, distance, speed) {
    return new Repel(this.game_.simulation, owner, position, lifetime, distance, speed);
  }
}
