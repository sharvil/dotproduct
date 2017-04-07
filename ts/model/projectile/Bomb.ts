import Listener from 'Listener';
import Projectile from 'model/projectile/Projectile';
import Weapon from 'model/Weapon';
import Vector from 'math/Vector';
import Game from 'ui/Game';
import Player from 'model/player/Player';
import Prize from 'model/Prize';

export default class Bomb extends Projectile {
  private blastRadius_ : number;
  private proxRadius_ : number;
  private proxActivator_ : Player | null;
  private lastDistanceToProxActivator_ : number;

  constructor(game : Game, owner : Player, level : number, position : Vector, velocity : Vector, lifetime : number, damage : number, bounceCount : number, blastRadius : number, proxRadius : number) {
    super(game, owner, level, lifetime, damage, bounceCount);

    this.position_ = position;
    this.velocity_ = velocity;

    this.blastRadius_ = blastRadius;
    this.proxRadius_ = proxRadius;
    this.proxActivator_ = null;
    this.lastDistanceToProxActivator_ = -1;
  }

  /** Returns whether or not this bomb is actually a mine. */
  public isMine() : boolean {
    return this.velocity_.magnitude() == 0;
  }

  protected checkPlayerCollision_(player : Player) : boolean {
    if (!player.isAlive() || this.owner_.isFriend(player)) {
      return false;
    }

    var distance = this.position_.subtract(player.getPosition()).magnitude();
    if (player.getDimensions().boundingRect.contains(this.position_)) {
      this.explode_(player);
      return true;
    } else if (!this.proxActivator_) {
      if (distance <= this.proxRadius_) {
        this.proxActivator_ = player;
        this.lastDistanceToProxActivator_ = distance;
      }
    } else if (player == this.proxActivator_) {
      if (distance > this.lastDistanceToProxActivator_) {
        this.explode_(null);
        return true;
      }
      this.lastDistanceToProxActivator_ = distance;
    }
    return false;
  }

  protected explode_(hitPlayer : Player | null) {
    super.explode_(hitPlayer);

    // Reset bomb state.
    this.velocity_ = Vector.ZERO;
    this.lifetime_ = 0;

    var localPlayer = this.game_.getPlayerIndex().getLocalPlayer();
    var viewport = this.game_.getViewport();

    // Figure out how much damage the local player is going to take from this bomb explosion.
    var damage = this.damage_;
    if (hitPlayer != localPlayer) {
      var normDistance = this.position_.subtract(localPlayer.getPosition()).magnitude() / this.blastRadius_;
      damage *= Math.max(1 - normDistance, 0);
    }

    if (damage > 0) {
      localPlayer.onDamage(this.owner_, this, damage);

      // TODO: get jitter ticks from settings.
      viewport.jitter(72);
    }

    if (viewport.contains(this.position_)) {
      this.game_.getResourceManager().playSound('explodeBomb');
    }
  }

  public onPrizeCollected(prize : Prize | null) {
    // Do nothing.
  }
}
