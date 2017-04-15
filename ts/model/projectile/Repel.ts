import Projectile from 'model/projectile/Projectile';
import Game from 'ui/Game';
import Vector from 'math/Vector';
import Player from 'model/player/Player';
import Prize from 'model/Prize';

export default class Repel extends Projectile {
  private distance_ : number;
  private speed_ : number;
  constructor(game : Game, owner : Player, position : Vector, lifetime : number, distance : number, speed : number) {
    super(game, owner, 0 /* level */, lifetime, 0, 0 /* bounceCount */);

    this.distance_ = distance;
    this.speed_ = speed;

    this.position_ = position;
  }

  /**
   * Given the position and velocity of an entity, this function returns the new
   * velocity the entity should have after being repelled.
   */
  public apply(position : Vector, velocity : Vector) : Vector {
    let delta = position.subtract(this.position_);
    if (delta.magnitude() <= this.distance_) {
      velocity = delta.resize(this.speed_);
    }
    return velocity;
  }

  public advanceTime() {
    this.game_.getPlayerIndex().forEach((player : Player) => {
      if (!this.owner_.isFriend(player)) {
        player.onRepelled(this);
      }
    });

    super.advanceTime();
  }

  public onRepelled(repel : Repel) {
    // Can't repel a repel.
  }

  protected checkPlayerCollision_(player : Player) : boolean {
    return false;
  }

  public onPrizeCollected(prize : Prize | null) {}
}
