import Range from 'math/Range';
import Player from 'model/player/Player';
import Weapon from 'model/Weapon';
import Game from 'ui/Game';
import Vector from 'math/Vector';

export default class BombBay implements Weapon {
  private game_ : Game;
  private bombBaySettings_ : any;
  private owner_ : Player;
  private level_ : Range;

  constructor(game : Game, bombBaySettings : any, owner : Player) {
    this.game_ = game;
    this.bombBaySettings_ = bombBaySettings;
    this.owner_ = owner;
    this.level_ = new Range(Math.min(0, bombBaySettings['maxLevel']), bombBaySettings['maxLevel'], 1);
    this.level_.setValue(bombBaySettings['initialLevel']);
  }

  public getType() : Weapon.Type {
    return Weapon.Type.BOMB;
  }

  public getLevel() : number {
    return this.level_.getValue();
  }

  public upgrade() {
    this.level_.increment();
  }

  public fire(angle : number, position : Vector, velocity : Vector, isMine : boolean, commitFireFn : (fireEnergy : number, fireDelay : number, recoilAcceleration : number) => boolean) : any {
    let level = this.level_.getValue();
    if (level < 0) {
      return null;
    }

    let fireEnergy = this.getFireEnergy_();
    let fireDelay = this.getFireDelay_();
    let recoilAcceleration = isMine ? 0 : this.getRecoilAcceleration_();

    if (!commitFireFn(fireEnergy, fireDelay, recoilAcceleration)) {
      return null;
    }

    let lifetime = this.getLifetime_();
    let damage = this.getDamage_();
    let bounceCount = this.getBounceCount_();
    let blastRadius = this.getBlastRadius_();
    let proxRadius = this.getProxRadius_();
    let newVelocity = isMine ? Vector.ZERO : velocity.add(Vector.fromPolar(this.getBombSpeed_(), angle));
    let projectile = this.game_.getModelObjectFactory().newBomb(this.game_, this.owner_, level, position, newVelocity, lifetime, damage, bounceCount, blastRadius, proxRadius);

    this.owner_.addProjectile(projectile);

    if (isMine) {
      this.game_.getResourceManager().playSound('mine' + level);
    } else {
      this.game_.getResourceManager().playSound('bomb' + level);
    }

    return {
      'type': this.getType(),
      'level': level,
      'vel': newVelocity.toArray(),
      'bounceCount': bounceCount
    };
  }

  public onFired(timeDiff : number, position : Vector, velocity : Vector, weaponData : any) {
    assert(weaponData['type'] == this.getType(), 'Cannot fire bomb with incorrect weapon type: ' + weaponData['type']);

    let level = weaponData['level'];
    let bounceCount = weaponData['bounceCount'];
    velocity = Vector.fromArray(weaponData['vel']);

    // Make sure the level is correct so the following getters use the right value for their calculations.
    this.level_.setValue(level);

    let projectile = this.game_.getModelObjectFactory().newBomb(this.game_, this.owner_, this.level_.getValue(), position, velocity, this.getLifetime_(), this.getDamage_(), bounceCount, this.getBlastRadius_(), this.getProxRadius_());
    for (let i = 0; i < timeDiff; ++i) {
      projectile.advanceTime();
    }
    this.owner_.addProjectile(projectile);
  }

  private getFireDelay_() : number {
    return this.bombBaySettings_['fireDelay'];
  }

  private getFireEnergy_() : number {
    return this.bombBaySettings_['fireEnergy'];
  }

  private getBombSpeed_() : number {
    return this.bombBaySettings_['speed'];
  }

  private getBounceCount_() : number {
    return this.bombBaySettings_['bounceCount'];
  }

  private getLifetime_() : number {
    return this.bombBaySettings_['lifetime'];
  }

  private getDamage_() : number {
    return this.bombBaySettings_['damage'] + this.level_.getValue() * this.bombBaySettings_['damageUpgrade'];
  }

  private getBlastRadius_() : number {
    return this.bombBaySettings_['blastRadius'] + this.level_.getValue() * this.bombBaySettings_['blastRadiusUpgrade'];
  }

  private getProxRadius_() : number {
    return this.bombBaySettings_['proxRadius'] + this.level_.getValue() * this.bombBaySettings_['proxRadiusUpgrade'];
  }

  private getRecoilAcceleration_() : number {
    return this.bombBaySettings_['recoilAcceleration'];
  }
}
