/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Game');

goog.require('goog.debug.ErrorHandler');
goog.require('goog.dom');
goog.require('goog.events.BrowserEvent');
goog.require('dotprod.Camera');
goog.require('dotprod.ChatMessages');
goog.require('dotprod.EffectIndex');
goog.require('dotprod.entities.LocalPlayer');
goog.require('dotprod.entities.RemotePlayer');
goog.require('dotprod.input.Keyboard');
goog.require('dotprod.layers.ChatLayer');
goog.require('dotprod.layers.EffectLayer');
goog.require('dotprod.layers.NotificationLayer');
goog.require('dotprod.layers.MapLayer');
goog.require('dotprod.layers.ProjectileLayer');
goog.require('dotprod.layers.RadarLayer');
goog.require('dotprod.layers.ScoreboardLayer');
goog.require('dotprod.layers.ShipLayer');
goog.require('dotprod.layers.StarLayer');
goog.require('dotprod.Map');
goog.require('dotprod.Notifications');
goog.require('dotprod.PlayerIndex');
goog.require('dotprod.Prize');
goog.require('dotprod.PrizeIndex');
goog.require('dotprod.ProjectileIndex');
goog.require('dotprod.Protocol');
goog.require('dotprod.Timer');
goog.require('dotprod.views.ChatView');
goog.require('dotprod.views.DebugView');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Protocol} protocol
 * @param {!dotprod.ResourceManager} resourceManager
 * @param {!Object} settings
 * @param {!Object.<number, number>} mapData
 */
dotprod.Game = function(protocol, resourceManager, settings, mapData) {
  /**
   * @type {!dotprod.Protocol}
   * @private
   */
  this.protocol_ = protocol;

  /**
   * @type {!dotprod.ResourceManager}
   * @private
   */
  this.resourceManager_ = resourceManager;

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = settings;

  /**
   * @type {!dotprod.input.Keyboard}
   * @private
   */
  this.keyboard_ = new dotprod.input.Keyboard();

  /**
   * @type {!HTMLCanvasElement}
   * @private
   */
  this.canvas_ = /** @type {!HTMLCanvasElement} */ (goog.dom.createElement('canvas'));
  this.canvas_.className = dotprod.Game.CANVAS_CLASS_NAME_;
  this.canvas_.width = dotprod.Game.WIDTH_;
  this.canvas_.height = dotprod.Game.HEIGHT_;

  /**
   * @type {!dotprod.Camera}
   * @private
   */
  this.camera_ = new dotprod.Camera(this, /** @type {!CanvasRenderingContext2D} */ (this.canvas_.getContext('2d')));

  /**
   * @type {!dotprod.Map}
   * @private
   */
  this.map_ = new dotprod.Map(this, mapData);

  /**
   * @type {!dotprod.ChatMessages}
   * @private
   */
  this.chat_ = new dotprod.ChatMessages();

  /**
   * @type {!dotprod.PrizeIndex}
   * @private
   */
  this.prizeIndex_ = new dotprod.PrizeIndex(this);

  /**
   * @type {!dotprod.ProjectileIndex}
   * @private
   */
  this.projectileIndex_ = new dotprod.ProjectileIndex();

  /**
   * @type {!dotprod.EffectIndex}
   * @private
   */
  this.effectIndex_ = new dotprod.EffectIndex();

  /**
   * @type {!dotprod.Notifications}
   * @private
   */
  this.notifications_ = new dotprod.Notifications();

  /**
   * @type {!dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = new dotprod.PlayerIndex(new dotprod.entities.LocalPlayer(this, this.settings_['name'], 0 /* ship */, this.camera_));

  /**
   * @type {!dotprod.views.ChatView}
   * @private
   */
  this.chatView_ = new dotprod.views.ChatView(this, this.chat_);

  /**
   * @type {!dotprod.views.DebugView}
   * @private
   */
  this.debugView_ = new dotprod.views.DebugView(this, this.camera_);

  /**
   * @type {!Array.<dotprod.layers.Layer>}
   * @private
   */
  this.layers_ = [
      new dotprod.layers.StarLayer(),
      new dotprod.layers.MapLayer(this),
      new dotprod.layers.ProjectileLayer(this.map_, this.playerIndex_, this.projectileIndex_),
      new dotprod.layers.ShipLayer(this.playerIndex_),
      new dotprod.layers.EffectLayer(this.effectIndex_),
      new dotprod.layers.NotificationLayer(this.notifications_),
      new dotprod.layers.ChatLayer(this.chat_),
      new dotprod.layers.RadarLayer(this),
      new dotprod.layers.ScoreboardLayer(this)
    ];

  /**
   * @type {number}
   * @private
   */
  this.lastTime_ = goog.now();

  /**
   * @type {number}
   * @private
   */
  this.tickResidue_ = 0;

  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PLAYER_ENTERED, goog.bind(this.onPlayerEntered_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PLAYER_LEFT, goog.bind(this.onPlayerLeft_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PLAYER_POSITION, goog.bind(this.onPlayerPosition_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PLAYER_DIED, goog.bind(this.onPlayerDied_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.CHAT_MESSAGE, goog.bind(this.onChatMessage_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.SHIP_CHANGE, goog.bind(this.onShipChanged_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.SCORE_UPDATE, goog.bind(this.onScoreUpdated_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PRIZE_SEED_UPDATE, goog.bind(this.onPrizeSeedUpdated_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PRIZE_COLLECTED, goog.bind(this.onPrizeCollected_, this));
  this.protocol_.startGame(0 /* ship */);

  dotprod.Timer.setInterval(goog.bind(this.renderingLoop_, this), 1);
};
goog.inherits(dotprod.Game, dotprod.views.View);

/**
 * @const
 * @type {number}
 */
dotprod.Game.TICK_PERIOD = 10;

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.Game.MAX_TICKS_PER_FRAME_ = 150;

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.Game.WIDTH_ = 1024;

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.Game.HEIGHT_ = 768;

/**
 * @const
 * @type {string}
 * @private
 */
dotprod.Game.CANVAS_CLASS_NAME_ = 'gv-map-canvas';

/**
 * @param {!HTMLDivElement} rootNode
 * @override
 */
dotprod.Game.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  rootNode.appendChild(this.canvas_);
  this.chatView_.renderDom(rootNode);
  this.debugView_.renderDom(rootNode);
};

/**
 * @return {!dotprod.Protocol}
 */
dotprod.Game.prototype.getProtocol = function() {
  return this.protocol_;
};

/**
 * @return {!dotprod.input.Keyboard}
 */
dotprod.Game.prototype.getKeyboard = function() {
  return this.keyboard_;
};

/**
 * @return {!dotprod.ResourceManager}
 */
dotprod.Game.prototype.getResourceManager = function() {
  return this.resourceManager_;
};

/**
 * @return {!Object}
 */
dotprod.Game.prototype.getSettings = function() {
  return this.settings_;
};

/**
 * @return {!dotprod.Map}
 */
dotprod.Game.prototype.getMap = function() {
  return this.map_;
};

/**
 * @return {!dotprod.PlayerIndex}
 */
dotprod.Game.prototype.getPlayerIndex = function() {
  return this.playerIndex_;
};

/**
 * @return {!dotprod.PrizeIndex}
 */
dotprod.Game.prototype.getPrizeIndex = function() {
  return this.prizeIndex_;
};

/**
 * @return {!dotprod.ProjectileIndex}
 */
dotprod.Game.prototype.getProjectileIndex = function() {
  return this.projectileIndex_;
};

/**
 * @return {!dotprod.EffectIndex}
 */
dotprod.Game.prototype.getEffectIndex = function() {
  return this.effectIndex_;
};

/**
 * @private
 */
dotprod.Game.prototype.renderingLoop_ = function() {
  var curTime = goog.now();
  var timeDiff = Math.floor(dotprod.Timer.millisToTicks(curTime - this.lastTime_ + this.tickResidue_));

  timeDiff = Math.min(timeDiff, dotprod.Game.MAX_TICKS_PER_FRAME_);

  for (var i = 0; i < timeDiff; ++i) {
    for (var j = 0; j < this.layers_.length; ++j) {
      this.layers_[j].update();
    }
  }

  var context = this.camera_.getContext();
  context.save();
    context.fillStyle = '#000';
    context.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
    for (var i = 0; i < this.layers_.length; ++i) {
      this.layers_[i].render(this.camera_);
    }
  context.restore();

  this.debugView_.update();

  this.tickResidue_ += curTime - this.lastTime_;
  this.tickResidue_ -= dotprod.Timer.ticksToMillis(timeDiff);
  this.lastTime_ = curTime;
};

/**
 * @param {!Object} packet
 * @private
 */
dotprod.Game.prototype.onPlayerEntered_ = function(packet) {
  var name = packet[0];
  var ship = packet[1];
  var bounty = packet[2];

  this.playerIndex_.addPlayer(new dotprod.entities.RemotePlayer(this, name, ship, bounty));
  this.notifications_.addMessage('Player entered: ' + name);
};

/**
 * @param {!Object} packet
 * @private
 */
dotprod.Game.prototype.onPlayerLeft_ = function(packet) {
  var name = packet[0];
  var player = this.playerIndex_.findByName(name);
  if (player) {
    this.projectileIndex_.removeProjectiles(player);
    this.playerIndex_.removePlayer(player);
    this.notifications_.addMessage('Player left: ' + name);
  }
};

/**
 * @param {!Object} packet
 * @private
 */
dotprod.Game.prototype.onPlayerPosition_ = function(packet) {
  var timeDiff = Math.floor(dotprod.Timer.millisToTicks(this.protocol_.getMillisSinceServerTime(packet[0])));
  var name = packet[1];
  var angle = packet[2];
  var position = new dotprod.Vector(packet[3], packet[4]);
  var velocity = new dotprod.Vector(packet[5], packet[6]);

  timeDiff = Math.min(timeDiff, 150);

  var player = this.playerIndex_.findByName(name);
  if (player) {
    player.onPositionUpdate(timeDiff, angle, position, velocity);
    if (packet.length > 7) {
      var type = packet[7];
      var level = packet[8];
      var bounceCount = packet[9];
      position = new dotprod.Vector(packet[10], packet[11]);
      velocity = new dotprod.Vector(packet[12], packet[13]);

      player.fireWeapon(timeDiff, type, level, bounceCount, position, velocity);
    }
  }
};

/**
 * @param {!Object} packet
 */
dotprod.Game.prototype.onPlayerDied_ = function(packet) {
  var timestamp = packet[0];
  var x = packet[1];
  var y = packet[2];
  var killee = this.playerIndex_.findByName(packet[3]);
  var killer = this.playerIndex_.findByName(packet[4]);
  var bountyGained = packet[5];

  if (!killer || !killee) {
    return;
  }

  killee.onDeath();
  killer.onKill(killee, bountyGained);
  this.prizeIndex_.addKillPrize(x, y);
  this.notifications_.addMessage(killee.getName() + '(' + bountyGained + ') killed by: ' + killer.getName());
};

/**
 * @param {!Object} packet
 */
dotprod.Game.prototype.onShipChanged_ = function(packet) {
  var player = this.playerIndex_.findByName(packet[0]);
  var ship = packet[1];

  if (player) {
    player.setShip(ship);
    this.projectileIndex_.removeProjectiles(player);
  }
};

/**
 * @param {!Object} packet
 */
dotprod.Game.prototype.onChatMessage_ = function(packet) {
  var player = this.playerIndex_.findByName(packet[0]);
  var message = packet[1];

  this.chat_.addMessage(player, message);
};

/**
 * @param {!Object} packet
 */
dotprod.Game.prototype.onScoreUpdated_ = function(packet) {
  var player = this.playerIndex_.findByName(packet[0]);
  var points = packet[1];
  var wins = packet[2];
  var losses = packet[3];

  if(player) {
    player.onScoreUpdate(points, wins, losses);
  }
};

dotprod.Game.prototype.onPrizeSeedUpdated_ = function(packet) {
  var seed = packet[1];
  var timeDeltaMillis = this.protocol_.getMillisSinceServerTime(packet[2]);

  var ticks = Math.floor(dotprod.Timer.millisToTicks(timeDeltaMillis));
  this.prizeIndex_.onSeedUpdate(seed, ticks);
};

dotprod.Game.prototype.onPrizeCollected_ = function(packet) {
  var player = this.playerIndex_.findByName(packet[0]);
  var type = packet[1];
  var xTile = packet[2];
  var yTile = packet[3];

  player.onPrizeCollected();
  this.prizeIndex_.removePrize(xTile, yTile);
};
