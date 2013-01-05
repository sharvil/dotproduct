/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Player');
goog.provide('dotprod.entities.Player.Presence');

goog.require('dotprod.entities.Entity');
goog.require('dotprod.model.BombBay');
goog.require('dotprod.model.Gun');
goog.require('dotprod.model.Weapon.Type');

/**
 * @constructor
 * @extends {dotprod.entities.Entity}
 * @param {!dotprod.Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {number} ship
 * @param {number} bounty
 */
dotprod.entities.Player = function(game, id, name, team, ship, bounty) {
  goog.base(this, game);

  /**
   * @type {!Object}
   * @protected
   */
  this.settings_ = game.getSettings();

  /**
   * @type {!Object}
   * @protected
   */
  this.shipSettings_ = this.settings_['ships'][ship];

  /**
   * @type {!dotprod.model.Gun}
   * @protected
   */
  this.gun_ = new dotprod.model.Gun(game, this.shipSettings_['bullet'], this);

  /**
   * @type {!dotprod.model.BombBay}
   * @protected
   */
  this.bombBay_ = new dotprod.model.BombBay(game, this.shipSettings_['bomb'], this);

  /**
   * @type {string}
   * @protected
   */
  this.id_ = id;

  /**
   * @type {string}
   * @protected
   */
  this.name_ = name;

  /**
   * @type {number}
   * @protected
   */
  this.team_ = team;

  /**
   * @type {number}
   * @protected
   */
  this.angleInRadians_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.energy_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.maxEnergy_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.ship_;

  /**
   * @type {number}
   * @protected
   */
  this.bounty_;

  /**
   * @type {!dotprod.entities.Player.Presence}
   * @protected
   */
  this.presence_ = dotprod.entities.Player.Presence.DEFAULT;

  /**
   * @type {number}
   * @protected
   */
  this.points_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.wins_ = 0;

  /**
   * @type {number}
   * @protected
   */
  this.losses_ = 0;

  this.setShip(ship);
  this.bounty_ = bounty;
};
goog.inherits(dotprod.entities.Player, dotprod.entities.Entity);

/**
 * @enum {number}
 */
dotprod.entities.Player.Presence = {
  DEFAULT: 0,
  TYPING: 1,
  AWAY: 2,
  ALL: 0x7FFFFFFF
};

/**
 * @type {string}
 * @const
 */
dotprod.entities.Player.SYSTEM_PLAYER_ID = '0';

/**
 * @return {string}
 */
dotprod.entities.Player.prototype.getId = function() {
  return this.id_;
};

/**
 * @return {string}
 */
dotprod.entities.Player.prototype.getName = function() {
  return this.name_;
};

/**
 * @return {number}
 */
dotprod.entities.Player.prototype.getEnergy = function () {
  return Math.floor(this.energy_);
};

/**
 * @return {number}
 */
dotprod.entities.Player.prototype.getMaxEnergy = function () {
  return this.maxEnergy_;
};

/**
 * @return {number}
 */
dotprod.entities.Player.prototype.getShip = function() {
  return this.ship_;
};

/**
 * @return {number}
 */
dotprod.entities.Player.prototype.getTeam = function() {
  return this.team_;
};

/**
 * @return {number}
 */
dotprod.entities.Player.prototype.getPoints = function() {
  return this.points_;
};

/**
 * @return {number}
 */
dotprod.entities.Player.prototype.getBounty = function () {
  return this.bounty_;
};

/**
 * @override
 */
dotprod.entities.Player.prototype.isAlive = function() {
  return this.energy_ > 0;
};

/**
 * Returns true if this player is a friend of (on the same team as) the other player.
 *
 * @param {!dotprod.entities.Player} other
 * @return {boolean}
 */
dotprod.entities.Player.prototype.isFriend = function(other) {
  return this.team_ == other.team_;
};

/**
 * @param {dotprod.entities.Player.Presence} presence
 */
dotprod.entities.Player.prototype.setPresence = function(presence) {
  this.presence_ |= presence;
};

/**
 * @param {dotprod.entities.Player.Presence} presence
 */
dotprod.entities.Player.prototype.clearPresence = function(presence) {
  this.presence_ &= ~presence;
};

/**
 * @param {dotprod.entities.Player.Presence} presence
 * @return {boolean}
 */
dotprod.entities.Player.prototype.hasPresence = function(presence) {
  return (this.presence_ & presence) != 0;
};

/**
 * @param {number} ship
 */
dotprod.entities.Player.prototype.setShip = function(ship) {
  this.ship_ = ship;
  this.shipSettings_ = this.settings_['ships'][this.ship_];
  this.gun_ = new dotprod.model.Gun(this.game_, this.shipSettings_['bullet'], this);
  this.bombBay_ = new dotprod.model.BombBay(this.game_, this.shipSettings_['bomb'], this);

  this.position_ = new dotprod.math.Vector(0, 0);
  this.velocity_ = new dotprod.math.Vector(0, 0);
  this.energy_ = 0;
  this.bounty_ = 0;
  this.xRadius_ = this.shipSettings_['xRadius'];
  this.yRadius_ = this.shipSettings_['yRadius'];
};

/**
 * @param {number} timeDiff
 * @param {number} type
 * @param {number} level
 * @param {number} bounceCount
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 */
dotprod.entities.Player.prototype.fireWeapon = function(timeDiff, type, level, bounceCount, position, velocity) {
  var projectile;
  switch (type) {
    case dotprod.model.Weapon.Type.BULLET:
      projectile = this.gun_.fireSynthetic(level, bounceCount, position, velocity);
      break;
    case dotprod.model.Weapon.Type.BOMB:
      projectile = this.bombBay_.fireSynthetic(level, bounceCount, position, velocity);
      break;
    default:
      return;
  }

  // TODO(sharvil): we need a better way to account for latency than directly
  // calling update on the projectile.
  for (var i = 0; i < timeDiff; ++i) {
    projectile.advanceTime();
  }
};

/**
 * @param {number} angle
 * @param {!dotprod.math.Vector} position
 * @param {!dotprod.math.Vector} velocity
 */
dotprod.entities.Player.prototype.respawn = goog.abstractMethod;

/**
 * Called when the player takes damage from a projectile fired by some other player.
 *
 * @param {!dotprod.entities.Player} player The player whose projectile is causing the damage.
 * @param {!dotprod.entities.Projectile} projectile The projectile that caused the damage.
 * @param {number} damage The damage, in energy units, caused by the projectile.
 */
dotprod.entities.Player.prototype.onDamage = goog.nullFunction;

/**
 * Called when this player is killed by someone.
 */
dotprod.entities.Player.prototype.onDeath = function() {
  ++this.losses_;
  this.bounty_ = 0;
  this.energy_ = 0;
};

/**
 * Called when this player kills someone.
 *
 * @param {!dotprod.entities.Player} killee The player who we just killed.
 * @param {number} extraPoints How many points were gained by killing this player.
 */
dotprod.entities.Player.prototype.onKill = function(killee, extraPoints) {
  this.points_ += this.settings_['game']['killPoints'] + extraPoints;
  ++this.wins_;
};

/**
 * Called when this player's score gets updated from the server.
 *
 * @param {number} points
 * @param {number} wins
 * @param {number} losses
 */
dotprod.entities.Player.prototype.onScoreUpdate = function(points, wins, losses) {
  this.points_ = points;
  this.wins_ = wins;
  this.losses_ = losses;
};

/**
 * Called when the server tells us that this player collected a prize.
 */
dotprod.entities.Player.prototype.onPrizeCollected = function() {
  ++this.bounty_;
};
