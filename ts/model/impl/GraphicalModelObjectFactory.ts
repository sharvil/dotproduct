import ModelObjectFactory from 'model/ModelObjectFactory';
import LocalPlayer from 'model/player/LocalPlayer';
import LocalPlayerSprite from 'model/player/LocalPlayerSprite';
import RemotePlayer from 'model/player/RemotePlayer';
import RemotePlayerSprite from 'model/player/RemotePlayerSprite';
import Bomb from 'model/projectile/Bomb';
import BombSprite from 'model/projectile/BombSprite';
import Bullet from 'model/projectile/Bullet';
import BulletSprite from 'model/projectile/BulletSprite';
import Burst from 'model/projectile/Burst';
import BurstSprite from 'model/projectile/BurstSprite';
import Decoy from 'model/projectile/Decoy';
import DecoySprite from 'model/projectile/DecoySprite';
import Repel from 'model/projectile/Repel';
import RepelSprite from 'model/projectile/RepelSprite';

export default class GraphicalModelObjectFactory implements ModelObjectFactory {
  constructor() {}

  public newLocalPlayer = function (game, id, name, team, ship) {
    var player = new LocalPlayer(game, id, name, team, ship);
    var sprite = new LocalPlayerSprite(game, player);

    return player;
  }

  public newRemotePlayer = function (game, id, name, team, isAlive, ship, bounty) {
    var player = new RemotePlayer(game, id, name, team, isAlive, ship, bounty);
    var sprite = new RemotePlayerSprite(game, player);

    return player;
  }

  public newBullet = function (game, owner, level, position, velocity, lifetime, damage, bounceCount) {
    var projectile = new Bullet(game, owner, level, position, velocity, lifetime, damage, bounceCount);
    var sprite = new BulletSprite(game, projectile);

    return projectile;
  }

  public newBomb = function (game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
    var projectile = new Bomb(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
    var sprite = new BombSprite(game, projectile);

    return projectile;
  }

  public newBurst = function (game, owner, position, velocity, lifetime, damage) {
    var projectile = new Burst(game, owner, position, velocity, lifetime, damage);
    var sprite = new BurstSprite(game, projectile);

    return projectile;
  }

  public newDecoy = function (game, owner, position, velocity, lifetime) {
    var projectile = new Decoy(game, owner, position, velocity, lifetime);
    var sprite = new DecoySprite(game, projectile);

    return projectile;
  }

  public newRepel = function (game, owner, position, lifetime, distance, speed) {
    var projectile = new Repel(game, owner, position, lifetime, distance, speed);
    var sprite = new RepelSprite(game, projectile);

    return projectile;
  }
}
