import Listener from 'Listener';
import Projectile from 'model/projectile/Projectile';
import Weapon from 'model/Weapon';
import Vector from 'math/Vector';
import Player from 'model/player/Player';
import Game from 'ui/Game';
import Prize from 'model/Prize';

export default class Burst extends Projectile {
  protected isActive_ : boolean;

  constructor(game : Game, owner : Player, position : Vector, velocity : Vector, lifetime : number, damage : number) {
    super(game, owner, 4 /* level */, lifetime, damage, -1 /* bounceCount */);

    this.isActive_ = false;

    this.position_ = position;
    this.velocity_ = velocity;
  }

  public isActive() : boolean {
    return this.isActive_;
  }

  protected bounce_() {
    super.bounce_();
    this.isActive_ = true;
  }

  protected checkPlayerCollision_(player : Player) : boolean {
    if (!player.isAlive || this.owner_.isFriend(player) || !this.isActive_) {
      return false;
    }

    if (player.getDimensions().boundingRect.contains(this.position_)) {
      this.explode_(player);
      return true;
    }
    return false;
  }

  protected explode_(hitPlayer : Player | null) {
    super.explode_(hitPlayer);

    this.lifetime_ = 0;

    if (hitPlayer) {
      hitPlayer.onDamage(this.owner_, this, this.damage_);
    }
  }

  public onPrizeCollected(prize : Prize) {
    // Do nothing.
  }
}
