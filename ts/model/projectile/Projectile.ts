import Entity from 'model/Entity';
import Player from 'model/player/Player';
import Listener from 'Listener';
import Game from 'ui/Game';
import Repel from 'model/projectile/Repel';

abstract class Projectile extends Entity {
  protected owner_ : Player;
  private level_ : number;
  protected lifetime_ : number;
  protected damage_ : number;
  private bounceCount_ : number;

  constructor(game : Game, owner : Player, level : number, lifetime : number, damage : number, bounceCount : number) {
    super(game);

    this.owner_ = owner;
    this.level_ = level;
    this.lifetime_ = lifetime;
    this.damage_ = damage;
    this.bounceCount_ = bounceCount;
  }

  /**
   * Returns the level of this projectile. The values vary for each type of
   * projectile, but the weakest level is 0.
   */
  public getLevel() : number {
    return this.level_;
  }

  /** This function returns true if the projectile is bouncy, false otherwise. */
  public isBouncing() : boolean {
    return this.bounceCount_ != 0;
  }

  protected abstract checkPlayerCollision_(player : Player) : boolean;

  /** |player| specifies the player who was directly hit or null if there was no direct hit. */
  protected explode_(player : Player | null) {
    Listener.fire(this, 'explode', player);
  }

  public advanceTime() {
    if (--this.lifetime_ <= 0) {
      this.invalidate();
      return;
    }

    this.updatePosition_();
    this.game_.getPlayerList().some(this.checkPlayerCollision_.bind(this));
  }

  /** This function is called when a repel may affect the projectile. */
  public onRepelled(repel : Repel) {
    this.velocity_ = repel.apply(this.position_, this.velocity_);
  }

  protected bounce_() {
    if (this.bounceCount_ == 0) {
      this.explode_(null);
    } else if (this.bounceCount_ > 0) {
      --this.bounceCount_;
    }
  }
}

namespace Projectile {
  type Event = 'explode';
}

export default Projectile;
