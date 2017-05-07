import Projectile from 'model/projectile/Projectile';
import Player from 'model/player/Player';
import Prize from 'model/Prize';
import Simulation from 'model/Simulation';
import Vector from 'math/Vector';

export default class Decoy extends Projectile {
  private direction_ : number;

  constructor(simulation : Simulation, owner : Player, position : Vector, velocity : Vector, lifetime : number) {
    super(simulation, owner, 0 /* level */, lifetime, 0 /* damage */, -1 /* bounceCount */);

    this.direction_ = owner.direction;
    this.position_ = position;
    this.velocity_ = velocity;
    this.radius_ = owner.getDimensions().radius;
  }

  public checkPlayerCollision_(player : Player) {
    return false;
  }

  public getOwner() : Player {
    return this.owner_;
  }

  public getDirection() : number {
    let ret = 2 * this.direction_ - this.owner_.direction;

    // TODO: fix this madness.
    while (ret >= 40) {
      ret -= 40;
    }
    while (ret < 0) {
      ret += 40;
    }
    return ret;
  }

  public onPrizeCollected(prize : Prize) {
    // Do nothing.
  }
}
