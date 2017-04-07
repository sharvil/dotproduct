import Bullet from 'model/projectile/Bullet';
import Listener from 'Listener';
import Player from 'model/player/Player';
import Projectile from 'model/projectile/Projectile';

export default class BulletGroup {
  private bullets_ : Array<Bullet>;

  constructor(bullets : Array<Bullet>) {
  // If there aren't at least two bullets, don't bother grouping.
    if (bullets.length < 2) {
      return;
    }

    this.bullets_ = bullets;

    for (var i = 0; i < this.bullets_.length; ++i) {
      Listener.add(this.bullets_[i], 'explode', this.onExplode_.bind(this));
    }
  }

  protected onExplode_(bullet : Projectile, player : Player | null) {
    // Only explode other bullets in the group if a bullet is exploding due to
    // a direct hit on a player.
    if (!player) {
      return;
    }

    // Notify all other bullets in the group that they should explode. The
    // original bullet will have a direct hit specified but all other bullets are
    // exploding because they're linked, not because they directly hit a player.
    for (var i = 0; i < this.bullets_.length; ++i) {
      if (this.bullets_[i] != bullet) {
        this.bullets_[i].explodeLinked();
      }
    }
  }
}
