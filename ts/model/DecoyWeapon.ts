import Vector from 'math/Vector';
import Weapon from 'model/Weapon';
import Player from 'model/player/Player';
import Game from 'ui/Game';

export default class DecoyWeapon implements Weapon {
  private game_ : Game;
  private settings_ : any;
  private owner_ : Player;
  private count_ : number;

  constructor(game : Game, decoySettings : any, owner : Player) {
    this.game_ = game;
    this.settings_ = decoySettings;
    this.owner_ = owner;
    this.count_ = this.settings_['initialCount'];
  }

  public getType() : Weapon.Type {
    return Weapon.Type.DECOY;
  }

  public getCount() : number {
    return this.count_;
  }

  public fire(position : Vector, commitFireFn : (fireEnergy : number, fireDelay : number) => boolean) : any {
    if (this.count_ <= 0 || !commitFireFn(0 /* fireEnergy */, this.settings_['fireDelay'])) {
      return null;
    }

    --this.count_;
    var lifetime = this.settings_['lifetime'];
    var projectile = this.game_.getModelObjectFactory().newDecoy(this.game_, this.owner_, this.owner_.getPosition(), this.owner_.getVelocity(), lifetime);
    this.owner_.addProjectile(projectile);

    return {
      'type': this.getType()
    };
  }

  public onFired(timeDiff : number, position : Vector, velocity : Vector, weaponData : any) {
    assert(weaponData['type'] == this.getType(), 'Cannot fire decoy with incorrect weapon type: ' + weaponData['type']);

    var lifetime = this.settings_['lifetime'];

    var projectile = this.game_.getModelObjectFactory().newDecoy(this.game_, this.owner_, this.owner_.getPosition(), this.owner_.getVelocity(), lifetime);
    this.owner_.addProjectile(projectile);

    for (var i = 0; i < timeDiff; ++i) {
      projectile.advanceTime();
    }
  }
}
