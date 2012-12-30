/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.entities.Player');
goog.provide('dotprod.entities.Player.Presence');

goog.require('dotprod.FontFoundry');
goog.require('dotprod.entities.Entity');
goog.require('dotprod.Image');
goog.require('dotprod.Map');
goog.require('dotprod.model.BombBay');
goog.require('dotprod.model.Gun');
goog.require('dotprod.model.Weapon.Type');
goog.require('dotprod.Palette');

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
  dotprod.entities.Entity.call(this, game);

  /**
   * @type {!dotprod.ResourceManager}
   * @private
   */
  this.resourceManager_ = game.getResourceManager();

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
  this.ship_ = ship;

  /**
   * @type {number}
   * @protected
   */
  this.bounty_ = bounty;

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

  /**
   * @type {dotprod.Image}
   * @protected
   */
  this.image_;

  /**
   * @type {!dotprod.Image}
   * @private
   */
  this.typingImage_ = this.resourceManager_.getImage('presenceTyping');

  /**
   * @type {!dotprod.Image}
   * @private
   */
  this.awayImage_ = this.resourceManager_.getImage('presenceAway');

  /**
   * @type {!dotprod.EffectIndex}
   * @private
   */
  this.effectIndex_ = this.game_.getEffectIndex();

  this.setShip(this.ship_);
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
  return this.energy_;
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
  this.image_ = this.resourceManager_.getImage('ship' + this.ship_);
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
 * @param {!dotprod.entities.Player} player
 * @param {!dotprod.entities.Projectile} projectile
 * @param {number} damage
 */
dotprod.entities.Player.prototype.takeDamage = function(player, projectile, damage) {};

/**
 * Called when this player is killed by another one.
 */
dotprod.entities.Player.prototype.onDeath = function() {
  var ensemble = this.resourceManager_.getVideoEnsemble('explode1');
  this.effectIndex_.addEffect(new dotprod.entities.Effect(ensemble.getAnimation(0), this.position_, this.velocity_));

  ensemble = this.resourceManager_.getVideoEnsemble('ship' + this.ship_ + '_junk');
  for (var i = 0; i < ensemble.getNumAnimations(); ++i) {
    var animation = ensemble.getAnimation(i);
    var deltaVelocity = dotprod.math.Vector.fromPolar(Math.random() * 2, Math.random() * 2 * Math.PI);
    var piece = new dotprod.entities.Effect(animation, this.position_, this.velocity_.add(deltaVelocity));
    this.effectIndex_.addEffect(piece);
  }

  ++this.losses_;
  this.bounty_ = 0;
  this.energy_ = 0;
};

/**
 * Called when this player kills another one.
 * @param {!dotprod.entities.Player} killee The player who we just killed.
 * @param {number} extraPoints How many points were gained by killing this player.
 */
dotprod.entities.Player.prototype.onKill = function(killee, extraPoints) {
  this.points_ += this.settings_['game']['killPoints'] + extraPoints;
  ++this.wins_;
};

/**
 * Called when this player's score gets updated from the server.
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
 * Returns true if this player is a friend (on the same team) of the other player.
 * @param {!dotprod.entities.Player} other
 * @return {boolean}
 */
dotprod.entities.Player.prototype.isFriend = function(other) {
  return this.team_ == other.team_;
};

dotprod.entities.Player.prototype.warpFlash = function() {
  var animation = this.resourceManager_.getVideoEnsemble('warp').getAnimation(0);
  this.effectIndex_.addEffect(new dotprod.entities.Effect(animation, this.position_, new dotprod.math.Vector(0, 0)));
};

/**
 * @param {!dotprod.Camera} camera
 */
dotprod.entities.Player.prototype.render = function(camera) {
  if (!this.isAlive()) {
    return;
  }

  var localPlayer = this.game_.getPlayerIndex().getLocalPlayer();
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * this.image_.getNumTiles());
  var dimensions = camera.getDimensions();
  var context = camera.getContext();

  var x = Math.floor(this.position_.getX() - dimensions.left - this.image_.getTileWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - this.image_.getTileHeight() / 2);

  this.image_.render(context, x, y, tileNum);

  var presenceImage = null;
  if (this.hasPresence(dotprod.entities.Player.Presence.AWAY)) {
    presenceImage = this.awayImage_;
  } else if (this.hasPresence(dotprod.entities.Player.Presence.TYPING)) {
    presenceImage = this.typingImage_;
  }

  if (presenceImage) {
    var speechX = x + this.image_.getTileWidth() - Math.floor(presenceImage.getTileWidth() / 2);
    var speechY = y - Math.floor(presenceImage.getTileHeight() / 2);
    presenceImage.render(context, speechX, speechY);
  }

  context.save();
    context.font = dotprod.FontFoundry.playerFont();
    context.fillStyle = this.isFriend(localPlayer) ? dotprod.Palette.friendColor() : dotprod.Palette.foeColor();
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(this.name_ + '(' + this.bounty_ + ')', x + this.image_.getTileWidth() / 2, y + this.image_.getTileHeight());
  context.restore();
};

// Called when the server tells us that this player collected a prize.
dotprod.entities.Player.prototype.onPrizeCollected = function() {
  ++this.bounty_;
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
  var map = this.game_.getMap();
  var playerIndex = this.game_.getPlayerIndex();
  for (var i = 0; i < timeDiff; ++i) {
    projectile.update(map, playerIndex);
  }
};
