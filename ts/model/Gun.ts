import BulletGroup from 'model/projectile/BulletGroup';
import Vector from 'math/Vector';
import Range from 'math/Range';
import Weapon from 'model/Weapon';
import Player from 'model/player/Player';
import Game from 'ui/Game';
import { ToggleState } from 'types';
import Bullet from 'model/projectile/Bullet';

/**
 * @constructor
 * @implements model.Weapon
 * @param {!Game} game
 * @param {!Object} gunSettings
 * @param {!model.player.Player} owner
 */
export default class Gun implements Weapon {
  private game_ : Game;
  private gunSettings_ : any;
  private owner_ : Player;
  private level_ : Range;
  private bouncingBullets_ : boolean;
  private multifireState_ : ToggleState;

  constructor(game, gunSettings, owner) {
    this.game_ = game;
    this.gunSettings_ = gunSettings;
    this.owner_ = owner;
    this.level_ = new Range(Math.min(0, this.gunSettings_['maxLevel']), this.gunSettings_['maxLevel'], 1);
    this.level_.setValue(this.gunSettings_['initialLevel']);

    this.bouncingBullets_ = false;
    this.multifireState_ = ToggleState.UNAVAILABLE;
  }

  public getType() : Weapon.Type {
    return Weapon.Type.GUN;
  }

  public getLevel() : number {
    return this.level_.getValue();
  }

  public upgrade() {
    this.level_.increment();
  }

  public setBounces(bounces : boolean) {
    this.bouncingBullets_ = bounces;
  }

  /**
   * Grants the ability to shoot multifire bullets from this gun. Multifire can
   * only be granted if the 'multifire' section exists in the gun settings.
   */
  public grantMultifire() {
    // If multifire is a newly granted capability, enable it by default.
    if (this.multifireState_ == ToggleState.UNAVAILABLE && this.gunSettings_['multifire']) {
      this.multifireState_ = ToggleState.ENABLED;
    }
  }

  public getMultifireState() : ToggleState {
    return this.multifireState_;
  }

  /**
   * Toggles multifire bullets on the gun. This function won't enable multifire if
   * it's not available.
   */
  public toggleMultifire() {
    if (this.multifireState_ == ToggleState.ENABLED) {
      this.multifireState_ = ToggleState.DISABLED;
    } else if (this.multifireState_ == ToggleState.DISABLED) {
      this.multifireState_ = ToggleState.ENABLED;
    }
  }

  public fire(angle : number, position : Vector, velocity : Vector, commitFireFn : (fireEnergy : number, fireDelay : number) => boolean) : any {
    var fireEnergy = this.getFireEnergy_();
    var fireDelay = this.getFireDelay_();
    var level = this.level_.getValue();

    if (level < 0 || !commitFireFn(fireEnergy, fireDelay)) {
      return null;
    }

    var factory = this.game_.getModelObjectFactory();
    var lifetime = this.getLifetime_();
    var damage = this.getDamage_();
    var bounceCount = this.getBounceCount_();
    var bulletSpeed = this.getBulletSpeed_();
    var multifireAngle = (this.multifireState_ == ToggleState.ENABLED) ? this.gunSettings_['multifire']['angle'] : 0;

    var bullets = new Array<Bullet>();
    if (this.gunSettings_['doubleBarrel']) {
      var bulletVelocity = velocity.add(Vector.fromPolar(bulletSpeed, angle));
      var leftPosition = position.add(Vector.fromPolar(10, angle - Math.PI / 2));
      var rightPosition = position.add(Vector.fromPolar(10, angle + Math.PI / 2));

      bullets.push(factory.newBullet(this.game_, this.owner_, level, leftPosition, bulletVelocity, lifetime, damage, bounceCount));
      bullets.push(factory.newBullet(this.game_, this.owner_, level, rightPosition, bulletVelocity, lifetime, damage, bounceCount));
    } else {
      var bulletVelocity = velocity.add(Vector.fromPolar(bulletSpeed, angle));
      bullets.push(factory.newBullet(this.game_, this.owner_, level, position, bulletVelocity, lifetime, damage, bounceCount));
    }

    if (this.multifireState_ == ToggleState.ENABLED) {
      var leftVelocity = velocity.add(Vector.fromPolar(bulletSpeed, angle - multifireAngle));
      var rightVelocity = velocity.add(Vector.fromPolar(bulletSpeed, angle + multifireAngle));
      bullets.push(factory.newBullet(this.game_, this.owner_, level, position, leftVelocity, lifetime, damage, bounceCount));
      bullets.push(factory.newBullet(this.game_, this.owner_, level, position, rightVelocity, lifetime, damage, bounceCount));
    }

    for (var i = 0; i < bullets.length; ++i) {
      this.owner_.addProjectile(bullets[i]);
    }

    new BulletGroup(bullets);
    this.game_.getResourceManager().playSound('gun' + level);

    return {
      'type': this.getType(),
      'angle': angle,
      'level': level,
      'bounceCount': bounceCount,
      'multifire': this.multifireState_ == ToggleState.ENABLED
    }
  }

  public onFired(timeDiff : number, position : Vector, velocity : Vector, weaponData : any) {
    assert(weaponData['type'] == this.getType(), 'Cannot fire gun with incorrect weapon type: ' + weaponData['type']);

    var factory = this.game_.getModelObjectFactory();
    var level = weaponData['level'];
    var angle = weaponData['angle'];
    var bounceCount = weaponData['bounceCount'];
    var isMultifire = weaponData['multifire'];

    // Make sure the level is correct so the following getters use the right value for their calculations.
    this.level_.setValue(level);

    var lifetime = this.getLifetime_();
    var damage = this.getDamage_();
    var bulletSpeed = this.getBulletSpeed_();
    var multifireAngle = isMultifire ? this.gunSettings_['multifire']['angle'] : 0;

    var bullets = new Array<Bullet>();
    if (this.gunSettings_['doubleBarrel']) {
      var bulletVelocity = velocity.add(Vector.fromPolar(bulletSpeed, angle));
      var leftPosition = position.add(Vector.fromPolar(10, angle - Math.PI / 2));
      var rightPosition = position.add(Vector.fromPolar(10, angle + Math.PI / 2));

      bullets.push(factory.newBullet(this.game_, this.owner_, level, leftPosition, bulletVelocity, lifetime, damage, bounceCount));
      bullets.push(factory.newBullet(this.game_, this.owner_, level, rightPosition, bulletVelocity, lifetime, damage, bounceCount));
    } else {
      var bulletVelocity = velocity.add(Vector.fromPolar(bulletSpeed, angle));
      bullets.push(factory.newBullet(this.game_, this.owner_, level, position, bulletVelocity, lifetime, damage, bounceCount));
    }

    if (isMultifire) {
      var leftVelocity = velocity.add(Vector.fromPolar(bulletSpeed, angle - multifireAngle));
      var rightVelocity = velocity.add(Vector.fromPolar(bulletSpeed, angle + multifireAngle));
      bullets.push(factory.newBullet(this.game_, this.owner_, level, position, leftVelocity, lifetime, damage, bounceCount));
      bullets.push(factory.newBullet(this.game_, this.owner_, level, position, rightVelocity, lifetime, damage, bounceCount));
    }

    for (var i = 0; i < bullets.length; ++i) {
      this.owner_.addProjectile(bullets[i]);
    }

    new BulletGroup(bullets);

    for (var i = 0; i < timeDiff; ++i) {
      for (var j = 0; j < bullets.length; ++j) {
        bullets[j].advanceTime();
      }
    }
  }

  private getFireDelay_() : number {
    if (this.multifireState_ == ToggleState.ENABLED) {
      return this.gunSettings_['multifire']['fireDelay'];
    }
    return this.gunSettings_['fireDelay'];
  }

  private getFireEnergy_() : number {
    var baseEnery = this.multifireState_ == ToggleState.ENABLED
      ? this.gunSettings_['multifire']['fireEnergy']
      : this.gunSettings_['fireEnergy'];
    return baseEnery * (this.level_.getValue() + 1);
  }

  private getBulletSpeed_() : number {
    return this.gunSettings_['speed'];
  }

  private getLifetime_() : number {
    return this.gunSettings_['lifetime'];
  }

  private getDamage_() : number {
    return this.gunSettings_['damage'] + this.level_.getValue() * this.gunSettings_['damageUpgrade'];
  }

  private getBounceCount_() : number {
    return this.gunSettings_['bounces'] && this.bouncingBullets_ ? -1 : 0;
  }
}
