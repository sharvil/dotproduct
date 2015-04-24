goog.provide('model.player.RemotePlayer');

goog.require('model.player.Player');
goog.require('time.Timer');
goog.require('math.Vector');

/**
 * @constructor
 * @extends {model.player.Player}
 * @param {!Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {boolean} isAlive
 * @param {number} ship
 * @param {number} bounty
 */
model.player.RemotePlayer = function(game, id, name, team, isAlive, ship, bounty) {
  goog.base(this, game, id, name, team, ship, bounty);

  /**
   * The timestamp, in millseconds, when we last interpolated a bounce off a wall.
   * We use this to ignore received position packets before the last bounce. It's
   * important to do so otherwise we would set the velocity to the pre-bounce velocity
   * resulting in another bounce into the wall.
   *
   * @type {number}
   * @private
   */
  this.bounceTimestamp_ = 0;

  /**
   * This is only used by RemotePlayer when we're adjusting the player's velocity
   * to interpolate to the correct location. It's defined here because we need to
   * bounce the velocity vector during collision detection.
   *
   * @type {!math.Vector}
   * @protected
   */
  this.originalVelocity_ = math.Vector.ZERO;

  /**
   * @type {number}
   * @private
   */
  this.velocityAdjustTimer_ = 0;

  this.energy_ = isAlive ? 1 : 0;
};
goog.inherits(model.player.RemotePlayer, model.player.Player);

/**
 * @type {number}
 * @private
 * @const
 */
model.player.RemotePlayer.MAX_DRIFT_PIXELS_ = 64;

/**
 * @type {number}
 * @private
 * @const
 */
model.player.RemotePlayer.VELOCITY_ADJUST_PERIOD_ = 20;

/**
 * @override
 */
model.player.RemotePlayer.prototype.respawn = function() {
  this.energy_ = 1;
  this.bounty_ = 0;
  this.velocity_ = math.Vector.ZERO;
  this.originalVelocity_ = math.Vector.ZERO;

  // Notify listeners that we've respawned after updating internal state.
  goog.base(this, 'respawn');
};

/**
 * @param {number} timeDiff
 * @param {number} angle
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 * @param {boolean} isSafe
 */
model.player.RemotePlayer.prototype.onPositionUpdate = function(timeDiff, angle, position, velocity, isSafe) {
  if (isSafe) {
    this.clearProjectiles_();
  }

  if (!this.isAlive()) {
    this.respawn();
    this.angleInRadians_ = angle;
    this.position_ = position;
    this.velocity_ = velocity;
    this.originalVelocity_ = velocity;
    return;
  }

  // Ignore position updates from before the last wall bounce.
  if(goog.now() - time.Timer.ticksToMillis(timeDiff) < this.bounceTimestamp_) {
    return;
  }

  var finalPosition = this.extrapolatePosition_(timeDiff, position, velocity);
  var distance = finalPosition.subtract(this.position_);

  this.angleInRadians_ = angle;
  this.velocity_ = velocity;
  this.originalVelocity_ = velocity;
  this.velocityAdjustTimer_ = model.player.RemotePlayer.VELOCITY_ADJUST_PERIOD_;

  if (Math.abs(distance.getX()) >= model.player.RemotePlayer.MAX_DRIFT_PIXELS_) {
    this.position_ = new math.Vector(finalPosition.getX(), this.position_.getY());
  } else {
    this.velocity_ = this.velocity_.add(new math.Vector(distance.getX(), 0).scale(1 / model.player.RemotePlayer.VELOCITY_ADJUST_PERIOD_));
  }

  if (Math.abs(distance.getY()) >= model.player.RemotePlayer.MAX_DRIFT_PIXELS_) {
    this.position_ = new math.Vector(this.position_.getX(), finalPosition.getY());
  } else {
    this.velocity_ = this.velocity_.add(new math.Vector(0, distance.getY()).scale(1 / model.player.RemotePlayer.VELOCITY_ADJUST_PERIOD_));
  }
};

/**
 * @override
 */
model.player.RemotePlayer.prototype.advanceTime = function() {
  var bounceFactor = this.game_.getSettings()['ships'][this.ship_]['bounceFactor'];
  --this.velocityAdjustTimer_;
  if (this.velocityAdjustTimer_ == 0) {
    this.velocity_ = this.originalVelocity_;
  }

  this.updatePosition_(bounceFactor);
};

/**
 * @param {number} timeDiff
 * @param {!math.Vector} startPosition
 * @param {!math.Vector} startVelocity
 * @return {!math.Vector}
 * @private
 */
model.player.RemotePlayer.prototype.extrapolatePosition_ = function(timeDiff, startPosition, startVelocity) {
  var bounceFactor = this.game_.getSettings()['ships'][this.ship_]['bounceFactor'];
  var savedPosition = this.position_;
  var savedVelocity = this.velocity_;

  this.position_ = startPosition;
  this.velocity_ = startVelocity;
  for (var i = 0; i < timeDiff; ++i) {
    this.updatePosition_(bounceFactor);
  }

  var extrapolatedPosition = this.position_;

  this.position_ = savedPosition;
  this.velocity_ = savedVelocity;

  return extrapolatedPosition;
};

/**
 * @override
 */
model.player.RemotePlayer.prototype.bounce_ = function() {
  this.velocityAdjustTimer_ = 0;
  this.bounceTimestamp_ = goog.now();
};
