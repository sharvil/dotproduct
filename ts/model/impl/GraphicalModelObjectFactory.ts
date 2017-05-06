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

export default class GraphicalModelObjectFactory implements ModelObjectFactory {
  constructor() {}

  public newLocalPlayer = function (game, id, name, team, ship) {
    let player = new LocalPlayer(game, id, name, team, ship);
    let sprite = new LocalPlayerSprite(game, player);

    return player;
  }

  public newRemotePlayer = function (game, id, name, team, isAlive, ship, bounty) {
    let player = new RemotePlayer(game, id, name, team, isAlive, ship, bounty);
    let sprite = new RemotePlayerSprite(game, player);

    return player;
  }

  public newBullet = function (game, owner, level, position, velocity, lifetime, damage, bounceCount) {
    let projectile = new Bullet(game, owner, level, position, velocity, lifetime, damage, bounceCount);
    let sprite = new BulletSprite(game, projectile);

    return projectile;
  }

  public newBomb = function (game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius) {
    let projectile = new Bomb(game, owner, level, position, velocity, lifetime, damage, bounceCount, blastRadius, proxRadius);
    let sprite = new BombSprite(game, projectile);

    return projectile;
  }

  public newBurst = function (game, owner, position, velocity, lifetime, damage) {
    let projectile = new Burst(game, owner, position, velocity, lifetime, damage);
    let sprite = new BurstSprite(game, projectile);

    return projectile;
  }

  public newDecoy = function (game, owner, position, velocity, lifetime) {
    let projectile = new Decoy(game, owner, position, velocity, lifetime);
    let sprite = new DecoySprite(game, projectile);

    return projectile;
  }

  public newRepel = function (game, owner, position, lifetime, distance, speed) {
    let projectile = new Repel(game, owner, position, lifetime, distance, speed);
    let sprite = new RepelSprite(game, projectile);

    return projectile;
  }
}
