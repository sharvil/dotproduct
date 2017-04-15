import Vector from 'math/Vector';
import Weapon from 'model/Weapon';
import Player from 'model/player/Player';
import Game from 'ui/Game';

export default class BurstWeapon implements Weapon {
  private game_ : Game;
  private settings_ : any;
  private owner_ : Player;
  private count_ : number;

  constructor(game : Game, burstSettings : any, owner : Player) {
    this.game_ = game;
    this.settings_ = burstSettings;
    this.owner_ = owner;
    this.count_ = this.settings_['initialCount'];
  }
  public getType() : Weapon.Type {
    return Weapon.Type.BURST;
  }

  public getCount() : number {
    return this.count_;
  }

  public fire(position : Vector, commitFireFn : (fireEnergy : number, fireDelay : number) => boolean) : any {
    if (this.count_ <= 0 || !commitFireFn(0 /* fireEnergy */, this.settings_['fireDelay'])) {
      return null;
    }

    --this.count_;
    let shrapnelCount = this.settings_['shrapnelCount'];
    let lifetime = this.settings_['lifetime'];
    let damage = this.settings_['damage'];

    for (let i = 0; i < shrapnelCount; ++i) {
      let velocity = Vector.fromPolar(this.settings_['speed'], i * 2 * Math.PI / shrapnelCount).add(this.owner_.getVelocity());
      let projectile = this.game_.getModelObjectFactory().newBurst(this.game_, this.owner_, this.owner_.getPosition(), velocity, lifetime, damage);
      this.owner_.addProjectile(projectile);
    }

    this.game_.getResourceManager().playSound('burst');

    return {
      'type': this.getType()
    };
  }

  public onFired(timeDiff : number, position : Vector, velocity : Vector, weaponData : any) {
    assert(weaponData['type'] == this.getType(), 'Cannot fire burst with incorrect weapon type: ' + weaponData['type']);

    let shrapnelCount = this.settings_['shrapnelCount'];
    let lifetime = this.settings_['lifetime'];
    let damage = this.settings_['damage'];

    for (let i = 0; i < shrapnelCount; ++i) {
      let shrapVel = Vector.fromPolar(this.settings_['speed'], i * 2 * Math.PI / shrapnelCount).add(velocity);
      let projectile = this.game_.getModelObjectFactory().newBurst(this.game_, this.owner_, position, shrapVel, lifetime, damage);
      for (let j = 0; j < timeDiff; ++j) {
        projectile.advanceTime();
      }
      this.owner_.addProjectile(projectile);
    }
  }
}
