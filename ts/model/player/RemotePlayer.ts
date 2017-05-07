import Player from 'model/player/Player';
import Timer from 'time/Timer';
import Vector from 'math/Vector';
import Simulation from 'model/Simulation';

export default class RemotePlayer extends Player {
  private static readonly MAX_DRIFT_PIXELS_ : number = 64;
  private static readonly VELOCITY_ADJUST_PERIOD_ : number = 20;

  /**
   * The timestamp, in millseconds, when we last interpolated a bounce off a wall.
   * We use this to ignore received position packets before the last bounce. It's
   * important to do so otherwise we would set the velocity to the pre-bounce velocity
   * resulting in another bounce into the wall.
   */
  private bounceTimestamp_ : number;

  /**
   * This is only used by RemotePlayer when we're adjusting the player's velocity
   * to interpolate to the correct location. It's defined here because we need to
   * bounce the velocity vector during collision detection.
   */
  private originalVelocity_ : Vector;
  private velocityAdjustTimer_ : number;

  constructor(simulation : Simulation, id : string, name : string, team : number, isAlive : boolean, ship : number, bounty : number) {
    super(simulation, id, name, team, ship, bounty);

    this.bounceTimestamp_ = 0;
    this.originalVelocity_ = Vector.ZERO;
    this.velocityAdjustTimer_ = 0;

    this.energy_ = isAlive ? 1 : 0;
  }

  public respawn() {
    this.energy_ = 1;
    this.bounty_ = 0;
    this.velocity_ = Vector.ZERO;
    this.originalVelocity_ = Vector.ZERO;

    // Notify listeners that we've respawned after updating internal state.
    super.respawn();
  }

  public onPositionUpdate(timeDiff : number, angle : number, position : Vector, velocity : Vector, isSafe : boolean) {
    if (isSafe) {
      this.clearProjectiles_();
    }

    if (!this.isAlive) {
      this.respawn();
      this.angleInRadians_ = angle;
      this.position_ = position;
      this.velocity_ = velocity;
      this.originalVelocity_ = velocity;
      return;
    }

    // Ignore position updates from before the last wall bounce.
    if (this.simulation_.getTimeMillis() - Timer.ticksToMillis(timeDiff) < this.bounceTimestamp_) {
      return;
    }

    let finalPosition = this.extrapolatePosition_(timeDiff, position, velocity);
    let distance = finalPosition.subtract(this.position_);

    this.angleInRadians_ = angle;
    this.velocity_ = velocity;
    this.originalVelocity_ = velocity;
    this.velocityAdjustTimer_ = RemotePlayer.VELOCITY_ADJUST_PERIOD_;

    if (Math.abs(distance.x) >= RemotePlayer.MAX_DRIFT_PIXELS_) {
      this.position_ = new Vector(finalPosition.x, this.position_.y);
    } else {
      this.velocity_ = this.velocity_.add(new Vector(distance.x, 0).scale(1 / RemotePlayer.VELOCITY_ADJUST_PERIOD_));
    }

    if (Math.abs(distance.y) >= RemotePlayer.MAX_DRIFT_PIXELS_) {
      this.position_ = new Vector(this.position_.x, finalPosition.y);
    } else {
      this.velocity_ = this.velocity_.add(new Vector(0, distance.y).scale(1 / RemotePlayer.VELOCITY_ADJUST_PERIOD_));
    }
  }

  public advanceTime() {
    let bounceFactor = this.simulation_.settings['ships'][this.ship_]['bounceFactor'];
    --this.velocityAdjustTimer_;
    if (this.velocityAdjustTimer_ == 0) {
      this.velocity_ = this.originalVelocity_;
    }

    this.updatePosition_(bounceFactor);
  }

  private extrapolatePosition_(timeDiff : number, startPosition : Vector, startVelocity : Vector) : Vector {
    let bounceFactor = this.simulation_.settings['ships'][this.ship_]['bounceFactor'];
    let savedPosition = this.position_;
    let savedVelocity = this.velocity_;

    this.position_ = startPosition;
    this.velocity_ = startVelocity;
    for (let i = 0; i < timeDiff; ++i) {
      this.updatePosition_(bounceFactor);
    }

    let extrapolatedPosition = this.position_;

    this.position_ = savedPosition;
    this.velocity_ = savedVelocity;

    return extrapolatedPosition;
  }

  protected bounce_() {
    this.velocityAdjustTimer_ = 0;
    this.bounceTimestamp_ = this.simulation_.getTimeMillis();
  }
}
