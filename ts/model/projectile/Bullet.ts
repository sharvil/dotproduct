import Listener from 'Listener';
import Projectile from 'model/projectile/Projectile';
import Weapon from 'model/Weapon';
import Vector from 'math/Vector';
import Player from 'model/player/Player';
import Prize from 'model/Prize';
import Simulation from 'model/Simulation';

export default class Bullet extends Projectile {
  constructor(simulation : Simulation, owner : Player, level : number, position : Vector, velocity : Vector, lifetime : number, damage : number, bounceCount : number) {
    super(simulation, owner, level, lifetime, damage, bounceCount);

    this.position_ = position;
    this.velocity_ = velocity;
  }

  protected checkPlayerCollision_(player : Player) {
    if (!player.isAlive || this.owner_.isFriend(player)) {
      return false;
    }

    if (player.getDimensions().boundingRect.contains(this.position_)) {
      this.explode_(player);
      return true;
    }
    return false;
  }

  /** Called when this Bullet explodes because another bullet in the group also exploded. */
  public explodeLinked() {
    super.explode_(null);
    this.velocity_ = Vector.ZERO;
    this.lifetime_ = 0;
  }

  protected explode_(hitPlayer : Player | null) {
    super.explode_(hitPlayer);

    this.velocity_ = Vector.ZERO;
    this.lifetime_ = 0;
    if (hitPlayer) {
      hitPlayer.onDamage(this.owner_, this, this.damage_);
    }
  }

  public onPrizeCollected(prize : Prize) {}
}
