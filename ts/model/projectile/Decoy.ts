import Projectile from 'model/projectile/Projectile';
import Player from 'model/player/Player';
import Prize from 'model/Prize';

export default class Decoy extends Projectile {
  private direction_ : number;

  constructor(game, owner, position, velocity, lifetime) {
    super(game, owner, 0 /* level */, lifetime, 0 /* damage */, -1 /* bounceCount */);

    this.direction_ = owner.getDirection();
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
    var ret = 2 * this.direction_ - this.owner_.getDirection();

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
