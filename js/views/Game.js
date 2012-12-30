/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Game');

goog.require('goog.debug.ErrorHandler');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventType');

goog.require('html5.AnimationFrame');
goog.require('html5.Notifications');

goog.require('dotprod.Camera');
goog.require('dotprod.EffectIndex');
goog.require('dotprod.input.Keyboard');
goog.require('dotprod.layers.EffectLayer');
goog.require('dotprod.layers.HudLayer');
goog.require('dotprod.layers.NotificationLayer');
goog.require('dotprod.layers.MapLayer');
goog.require('dotprod.layers.ProjectileLayer');
goog.require('dotprod.layers.RadarLayer');
goog.require('dotprod.layers.ShipLayer');
goog.require('dotprod.layers.StarLayer');
goog.require('dotprod.Map');
goog.require('dotprod.Notifications');
goog.require('dotprod.PlayerIndex');
goog.require('dotprod.Prize');
goog.require('dotprod.PrizeIndex');
goog.require('dotprod.ProjectileIndex');
goog.require('dotprod.Protocol');
goog.require('dotprod.sprites.LocalPlayerSprite');
goog.require('dotprod.sprites.RemotePlayerSprite');
goog.require('dotprod.Timer');
goog.require('dotprod.Timestamp');
goog.require('dotprod.views.ChatView');
goog.require('dotprod.views.DebugView');
goog.require('dotprod.views.ScoreboardView');
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

  var startingShip = Math.floor(Math.random() * this.settings_['ships'].length);
  var localPlayer = new dotprod.sprites.LocalPlayerSprite(this, this.settings_['id'], this.settings_['name'], this.settings_['team'], startingShip);

  /**
   * @type {!dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = new dotprod.PlayerIndex(localPlayer);

  /**
   * @type {!dotprod.Notifications}
   * @private
   */
  this.notifications_ = new dotprod.Notifications(localPlayer);

  /**
   * @type {!dotprod.views.ChatView}
   * @private
   */
  this.chatView_ = new dotprod.views.ChatView(this);

  /**
   * @type {!dotprod.views.ScoreboardView}
   * @private
   */
  this.scoreboardView_ = new dotprod.views.ScoreboardView(this);

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
      new dotprod.layers.ProjectileLayer(this),
      new dotprod.layers.ShipLayer(this.playerIndex_),
      new dotprod.layers.EffectLayer(this.effectIndex_),
      new dotprod.layers.NotificationLayer(this.notifications_),
      new dotprod.layers.RadarLayer(this),
      new dotprod.layers.HudLayer(this)
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

  /**
   * @type {number}
   * @private
   */
  this.animationId_ = 0;

  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PLAYER_ENTERED, goog.bind(this.onPlayerEntered_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PLAYER_LEFT, goog.bind(this.onPlayerLeft_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PLAYER_POSITION, goog.bind(this.onPlayerPosition_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PLAYER_DIED, goog.bind(this.onPlayerDied_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.CHAT_MESSAGE, goog.bind(this.onChatMessage_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.SHIP_CHANGE, goog.bind(this.onShipChanged_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.SCORE_UPDATE, goog.bind(this.onScoreUpdated_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PRIZE_SEED_UPDATE, goog.bind(this.onPrizeSeedUpdated_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.PRIZE_COLLECTED, goog.bind(this.onPrizeCollected_, this));
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.SET_PRESENCE, goog.bind(this.onSetPresence_, this));
  this.protocol_.startGame(startingShip);

  goog.events.listen(window, goog.events.EventType.RESIZE, goog.bind(this.onResize_, this));
  goog.events.listen(this.canvas_, goog.events.EventType.MOUSEMOVE, goog.bind(this.onMouseMoved_, this));

  goog.events.listen(window, goog.events.EventType.FOCUS, function() { localPlayer.clearPresence(dotprod.entities.Player.Presence.AWAY); });
  goog.events.listen(window, goog.events.EventType.BLUR, function() { localPlayer.setPresence(dotprod.entities.Player.Presence.AWAY); });

  // TODO(sharvil): hack, come up with a better interface.
  goog.events.listen(window, goog.events.EventType.MOUSEDOWN, function() { html5.Notifications.requestPermission(); });

  dotprod.Timer.setInterval(goog.bind(this.heartbeat_, this), 100);
};
goog.inherits(dotprod.Game, dotprod.views.View);

/**
 * @const
 * @type {number}
 * @private
 */
dotprod.Game.MAX_TICKS_PER_FRAME_ = 150;

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
  this.scoreboardView_.renderDom(rootNode);

  // This starts the rendering loop once the canvas has been added to the DOM.
  this.onResize_();
  this.renderingLoop_();
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
dotprod.Game.prototype.heartbeat_ = function() {
  // Keep the game running even if we're in the background.
  var curTime = goog.now();
  while (curTime - this.lastTime_ > 500) {
    html5.AnimationFrame.cancel(this.animationId_);
    this.renderingLoop_();
  }
};

/**
 * @private
 */
dotprod.Game.prototype.renderingLoop_ = function() {
  this.animationId_ = html5.AnimationFrame.request(goog.bind(this.renderingLoop_, this));

  var curTime = goog.now();
  var timeDiff = dotprod.Timer.millisToTicks(curTime - this.lastTime_ + this.tickResidue_);

  timeDiff = Math.min(timeDiff, dotprod.Game.MAX_TICKS_PER_FRAME_);

  for (var i = 0; i < timeDiff; ++i) {
    for (var j = 0; j < this.layers_.length; ++j) {
      this.layers_[j].update();
    }
  }

  var position = this.playerIndex_.getLocalPlayer().getPosition();
  this.camera_.setPosition(Math.floor(position.getX()), Math.floor(position.getY()));

  var context = this.camera_.getContext();
  context.save();
    context.fillStyle = '#000';
    context.fillRect(0, 0, this.canvas_.width, this.canvas_.height);
    for (var i = 0; i < this.layers_.length; ++i) {
      this.layers_[i].render(this.camera_);
    }
  context.restore();

  this.scoreboardView_.update();
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
  var id = packet[0];
  var name = packet[1];
  var team = packet[2];
  var ship = packet[3];
  var bounty = packet[4];
  var presence = /** @type {!dotprod.entities.Player.Presence} */ (packet[5]);

  var player = new dotprod.sprites.RemotePlayerSprite(this, id, name, team, ship, bounty);
  player.setPresence(presence);
  this.playerIndex_.addPlayer(player);

  this.notifications_.addEnterMessage('Player entered: ' + name);
};

/**
 * @param {!Object} packet
 * @private
 */
dotprod.Game.prototype.onPlayerLeft_ = function(packet) {
  var id = packet[0];
  var player = this.playerIndex_.findById(id);
  if (player) {
    this.projectileIndex_.removeProjectiles(player);
    this.playerIndex_.removePlayer(player);
    this.notifications_.addEnterMessage('Player left: ' + player.getName());
  }
};

/**
 * @param {!Object} packet
 * @private
 */
dotprod.Game.prototype.onPlayerPosition_ = function(packet) {
  var timeDiff = dotprod.Timer.millisToTicks(this.protocol_.getMillisSinceServerTime(packet[0]));
  var id = packet[1];
  var angle = packet[2];
  var position = new dotprod.math.Vector(packet[3], packet[4]);
  var velocity = new dotprod.math.Vector(packet[5], packet[6]);

  timeDiff = Math.min(timeDiff, 150);

  var player = this.playerIndex_.findById(id);
  if (player) {
    player.onPositionUpdate(timeDiff, angle, position, velocity);
    if (packet.length > 7) {
      var type = packet[7];
      var level = packet[8];
      var bounceCount = packet[9];
      position = new dotprod.math.Vector(packet[10], packet[11]);
      velocity = new dotprod.math.Vector(packet[12], packet[13]);

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
  var killee = this.playerIndex_.findById(packet[3]);
  var killer = this.playerIndex_.findById(packet[4]);
  var bountyGained = packet[5];

  if (!killer || !killee) {
    return;
  }

  killee.onDeath();
  killer.onKill(killee, bountyGained);
  this.prizeIndex_.addKillPrize(x, y);

  var message = killee.getName() + '(' + bountyGained + ') killed by: ' + killer.getName()
  if (killer == this.playerIndex_.getLocalPlayer()) {
    this.notifications_.addPersonalMessage(message);
  } else {
    this.notifications_.addMessage(message);
  }
};

/**
 * @param {!Object} packet
 */
dotprod.Game.prototype.onShipChanged_ = function(packet) {
  var player = this.playerIndex_.findById(packet[0]);
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
  var playerId = packet[0];
  var message = packet[1];

  if (playerId == dotprod.entities.Player.SYSTEM_PLAYER_ID) {
    this.chatView_.addSystemMessage(message);
  } else {
    var player = this.playerIndex_.findById(packet[0]);
    if (player) {
      this.chatView_.addMessage(player, message);
    }
  }
};

/**
 * @param {!Object} packet
 */
dotprod.Game.prototype.onScoreUpdated_ = function(packet) {
  var player = this.playerIndex_.findById(packet[0]);
  var points = packet[1];
  var wins = packet[2];
  var losses = packet[3];

  if(player) {
    player.onScoreUpdate(points, wins, losses);
  }
};

dotprod.Game.prototype.onPrizeSeedUpdated_ = function(packet) {
  var seed = packet[0];
  var timeDeltaMillis = this.protocol_.getMillisSinceServerTime(packet[1]);

  var ticks = dotprod.Timer.millisToTicks(timeDeltaMillis);
  this.prizeIndex_.onSeedUpdate(seed, ticks);
};

dotprod.Game.prototype.onPrizeCollected_ = function(packet) {
  var player = this.playerIndex_.findById(packet[0]);
  var type = packet[1];
  var xTile = packet[2];
  var yTile = packet[3];

  var prize = this.prizeIndex_.getPrize(xTile, yTile);
  if (prize) {
    player.onPrizeCollected();
    this.prizeIndex_.removePrize(prize);
  }
};

/**
 * @param {!Object} packet
 * @private
 */
dotprod.Game.prototype.onSetPresence_ = function(packet) {
  var player = this.playerIndex_.findById(packet[0]);
  var presence = /** @type {dotprod.entities.Player.Presence} */ (packet[1]);
  player.clearPresence(dotprod.entities.Player.Presence.ALL);
  player.setPresence(presence);
};

/**
 * @param {!goog.events.BrowserEvent} event
 * @private
 */
dotprod.Game.prototype.onMouseMoved_ = function(event) {
  if (event.offsetX < 10) {
    this.scoreboardView_.show();
  } else {
    this.scoreboardView_.hide();
  }
};

/**
 * @private
 */
dotprod.Game.prototype.onResize_ = function() {
  this.canvas_.width = window.innerWidth - this.canvas_.parentNode.offsetLeft;
  this.canvas_.height = window.innerHeight - this.canvas_.parentNode.offsetTop;
};
