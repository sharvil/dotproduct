import ModelObjectFactory from 'model/ModelObjectFactory';
import LocalPlayer from 'model/player/LocalPlayer';
import RemotePlayer from 'model/player/RemotePlayer';
import Bomb from 'model/projectile/Bomb';
import Bullet from 'model/projectile/Bullet';
import Burst from 'model/projectile/Burst';
import Decoy from 'model/projectile/Decoy';
import Repel from 'model/projectile/Repel';

export default class HeadlessModelObjectFactory implements ModelObjectFactory {
  constructor() {}

  public newLocalPlayer = function (game, id, name, team, ship) {
    return new LocalPlayer(game, id, name, team, ship);
  }

  public newRemotePlayer = function (game, id, name, team, isAlive, ship, bounty) {
    return new RemotePlayer(game, id, name, team, isAlive, ship, bounty);
  }

  public newBullet = function (game, owner, level, position, velocity, lifetime, damage, bounceCount) {
    return new Bullet(game, owner, level, position, velocity, lifetime, damage, bounceCount);
  }

  public newBomb = function (game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
    return new Bomb(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
  }

  public newBurst = function (game, owner, position, velocity, lifetime, damage) {
    return new Burst(game, owner, position, velocity, lifetime, damage);
  }

  public newDecoy = function (game, owner, position, velocity, lifetime) {
    return new Decoy(game, owner, position, velocity, lifetime);
  }

  public newRepel = function (game, owner, position, lifetime, distance, speed) {
    return new Repel(game, owner, position, lifetime, distance, speed);
  }
}
