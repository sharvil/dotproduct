import Vector from 'math/Vector';
import Weapon from 'model/Weapon';
import Player from 'model/player/Player';
import Simulation from 'model/Simulation';

export default class RepelWeapon implements Weapon {
  private simulation_ : Simulation;
  private settings_ : any;
  private owner_ : Player;
  private count_ : number;

  constructor(simulation : Simulation, repelSettings : any, owner : Player) {
    this.simulation_ = simulation;
    this.settings_ = repelSettings;
    this.owner_ = owner;
    this.count_ = this.settings_['initialCount'];
  }

  public getType() : Weapon.Type {
    return Weapon.Type.REPEL;
  }

  public getCount() : number {
    return this.count_;
  }

  public fire(position : Vector, commitFireFn : (fireEnergy : number, fireDelay : number) => boolean) : any {
    if (this.count_ <= 0 || !commitFireFn(0 /* fireEnergy */, this.settings_['fireDelay'])) {
      return null;
    }

    --this.count_;

    let lifetime = this.settings_['lifetime'];
    let distance = this.settings_['distance'];
    let speed = this.settings_['speed'];

    let projectile = this.simulation_.modelObjectFactory.newRepel(this.owner_, this.owner_.getPosition(), lifetime, distance, speed);
    this.owner_.addProjectile(projectile);

    return {
      'type': this.getType()
    };

  }

  public onFired(timeDiff : number, position : Vector, velocity : Vector, weaponData : any) {
    assert(weaponData['type'] == this.getType(), 'Cannot fire repel with incorrect weapon type: ' + weaponData['type']);

    let lifetime = this.settings_['lifetime'];
    let distance = this.settings_['distance'];
    let speed = this.settings_['speed'];

    let projectile = this.simulation_.modelObjectFactory.newRepel(this.owner_, position, lifetime, distance, speed);
    this.owner_.addProjectile(projectile);

    for (let i = 0; i < timeDiff; ++i) {
      projectile.advanceTime();
    }
  }
}
