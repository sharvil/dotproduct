/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Game');

goog.require('goog.asserts');
goog.require('goog.debug.ErrorHandler');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventType');

goog.require('html5.AnimationFrame');
goog.require('html5.Notifications');

goog.require('dotprod.FlagIndex');
goog.require('dotprod.graphics.Painter');
goog.require('dotprod.graphics.Tween');
goog.require('dotprod.input.Keyboard');
goog.require('dotprod.layers.HudLayer');
goog.require('dotprod.layers.NotificationLayer');
goog.require('dotprod.layers.MapLayer');
goog.require('dotprod.layers.RadarLayer');
goog.require('dotprod.layers.Starfield');
goog.require('dotprod.layers.WeaponIndicators');
goog.require('dotprod.model.Map');
goog.require('dotprod.model.impl.GraphicalModelObjectFactory');
goog.require('dotprod.model.impl.HeadlessModelObjectFactory');
goog.require('dotprod.model.Prize');
goog.require('dotprod.model.Simulation');
goog.require('dotprod.Notifications');
goog.require('dotprod.PlayerIndex');
goog.require('dotprod.PrizeIndex');
goog.require('dotprod.net.Protocol');
goog.require('dotprod.Timer');
goog.require('dotprod.Timestamp');
goog.require('dotprod.Viewport');
goog.require('dotprod.views.ChatView');
goog.require('dotprod.views.DebugView');
goog.require('dotprod.views.ScoreboardView');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.net.Protocol} protocol
 * @param {!dotprod.ResourceManager} resourceManager
 * @param {!Object} settings
 * @param {!Object.<number, number>} mapData
 * @param {!Array.<!Object>} tileProperties
 */
dotprod.Game = function(protocol, resourceManager, settings, mapData, tileProperties) {
  /**
   * @type {!dotprod.net.Protocol}
   * @private
   */
  this.protocol_ = protocol;

  /**
   * @type {!dotprod.ResourceManager}
   * @private
   */
  this.resourceManager_ = resourceManager;

  /**
   * @type {!dotprod.model.ModelObjectFactory}
   * @private
   */
  this.modelObjectFactory_ = new dotprod.model.impl.GraphicalModelObjectFactory();

  /**
   * @type {!dotprod.model.Simulation}
   * @private
   */
  this.simulation_ = new dotprod.model.Simulation(this.modelObjectFactory_);

  /**
   * @type {!dotprod.graphics.Painter}
   * @private
   */
  this.painter_ = new dotprod.graphics.Painter();

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
   * @type {!dotprod.Viewport}
   * @private
   */
  this.viewport_ = new dotprod.Viewport(this, /** @type {!CanvasRenderingContext2D} */ (this.canvas_.getContext('2d')));

  /**
   * @type {!dotprod.model.Map}
   * @private
   */
  this.map_ = new dotprod.model.Map(this, mapData, tileProperties);

  var startingShip = Math.floor(Math.random() * this.settings_['ships'].length);
  var localPlayer = this.modelObjectFactory_.newLocalPlayer(this, this.settings_['id'], this.settings_['name'], this.settings_['team'], startingShip);

  /**
   * @type {!dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = new dotprod.PlayerIndex(localPlayer);

  /**
   * @type {!dotprod.PrizeIndex}
   * @private
   */
  this.prizeIndex_ = new dotprod.PrizeIndex(this);

  /**
   * @type {!dotprod.FlagIndex}
   * @private
   */
  this.flagIndex_ = new dotprod.FlagIndex(this);

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
  this.debugView_ = new dotprod.views.DebugView(this, this.viewport_);

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

  new dotprod.layers.Starfield(this);
  new dotprod.layers.MapLayer(this);
  new dotprod.layers.NotificationLayer(this, this.notifications_);
  new dotprod.layers.RadarLayer(this);
  new dotprod.layers.HudLayer(this);
  new dotprod.layers.WeaponIndicators(this);

  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.PLAYER_ENTERED, goog.bind(this.onPlayerEntered_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.PLAYER_LEFT, goog.bind(this.onPlayerLeft_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.PLAYER_POSITION, goog.bind(this.onPlayerPosition_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.PLAYER_DIED, goog.bind(this.onPlayerDied_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.CHAT_MESSAGE, goog.bind(this.onChatMessage_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.SHIP_CHANGE, goog.bind(this.onShipChanged_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.SCORE_UPDATE, goog.bind(this.onScoreUpdated_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.PRIZE_SEED_UPDATE, goog.bind(this.onPrizeSeedUpdated_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.PRIZE_COLLECTED, goog.bind(this.onPrizeCollected_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.SET_PRESENCE, goog.bind(this.onSetPresence_, this));
  this.protocol_.registerHandler(dotprod.net.Protocol.S2CPacketType.FLAG_UPDATE, goog.bind(this.onFlagUpdate_, this));
  this.protocol_.startGame(startingShip);

  this.viewport_.followPlayer(localPlayer);

  goog.events.listen(window, goog.events.EventType.RESIZE, goog.bind(this.onResize_, this));
  goog.events.listen(this.canvas_, goog.events.EventType.MOUSEMOVE, goog.bind(this.onMouseMoved_, this));

  goog.events.listen(window, goog.events.EventType.FOCUS, function() { localPlayer.clearPresence(dotprod.model.player.Player.Presence.AWAY); });
  goog.events.listen(window, goog.events.EventType.BLUR, function() { localPlayer.setPresence(dotprod.model.player.Player.Presence.AWAY); });

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
 * @return {!dotprod.model.Simulation}
 */
dotprod.Game.prototype.getSimulation = function() {
  goog.asserts.assert(!!this.simulation_, 'Simulation is null');
  return this.simulation_;
};

/**
 * @return {!dotprod.graphics.Painter}
 */
dotprod.Game.prototype.getPainter = function() {
  goog.asserts.assert(!!this.painter_, 'Painter is null');
  return this.painter_;
};

/**
 * @return {!dotprod.net.Protocol}
 */
dotprod.Game.prototype.getProtocol = function() {
  goog.asserts.assert(!!this.protocol_, 'Protocol is null');
  return this.protocol_;
};

/**
 * @return {!dotprod.input.Keyboard}
 */
dotprod.Game.prototype.getKeyboard = function() {
  goog.asserts.assert(!!this.keyboard_, 'Keyboard is null');
  return this.keyboard_;
};

/**
 * @return {!dotprod.ResourceManager}
 */
dotprod.Game.prototype.getResourceManager = function() {
  goog.asserts.assert(!!this.resourceManager_, 'Resource maanger is null');
  return this.resourceManager_;
};

/**
 * @return {!Object}
 */
dotprod.Game.prototype.getSettings = function() {
  goog.asserts.assert(!!this.settings_, 'Settings is null');
  return this.settings_;
};

/**
 * @return {!dotprod.model.Map}
 */
dotprod.Game.prototype.getMap = function() {
  goog.asserts.assert(!!this.map_, 'Map is null');
  return this.map_;
};

/**
 * @return {!dotprod.PlayerIndex}
 */
dotprod.Game.prototype.getPlayerIndex = function() {
  goog.asserts.assert(!!this.playerIndex_, 'Player index is null');
  return this.playerIndex_;
};

/**
 * @return {!dotprod.PrizeIndex}
 */
dotprod.Game.prototype.getPrizeIndex = function() {
  goog.asserts.assert(!!this.prizeIndex_, 'Prize index is null');
  return this.prizeIndex_;
};

/**
 * @return {!dotprod.FlagIndex}
 */
dotprod.Game.prototype.getFlagIndex = function() {
  goog.asserts.assert(!!this.flagIndex_, 'Flag index is null');
  return this.flagIndex_;
};

/**
 * @return {!dotprod.model.ModelObjectFactory}
 */
dotprod.Game.prototype.getModelObjectFactory = function() {
  goog.asserts.assert(!!this.modelObjectFactory_, 'Model object factory is null');
  return this.modelObjectFactory_;
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
    this.simulation_.advanceTime();
  }

  this.viewport_.update();

  for (var i = 0; i < timeDiff; ++i) {
    dotprod.graphics.Tween.advanceAll();
  }

  this.painter_.render(this.viewport_);

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
  var isAlive = packet[3];
  var ship = packet[4];
  var bounty = packet[5];
  var presence = /** @type {!dotprod.model.player.Player.Presence} */ (packet[6]);

  var player = this.modelObjectFactory_.newRemotePlayer(this, id, name, team, isAlive, ship, bounty);
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
  var isSafe = packet[7];

  timeDiff = Math.min(timeDiff, 150);

  var player = this.playerIndex_.findById(id);
  if (player) {
    player.onPositionUpdate(timeDiff, angle, position, velocity, isSafe);
    if (packet.length > 8) {
      var type = packet[8];
      var level = packet[9];
      var bounceCount = packet[10];
      position = new dotprod.math.Vector(packet[11], packet[12]);
      velocity = new dotprod.math.Vector(packet[13], packet[14]);

      player.fireWeapon(timeDiff, type, level, bounceCount, position, velocity);
    }
  }
};

/**
 * @param {!Object} packet
 * @private
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
 * @private
 */
dotprod.Game.prototype.onShipChanged_ = function(packet) {
  var player = this.playerIndex_.findById(packet[0]);
  var ship = packet[1];

  if (player) {
    player.setShip(ship);
  }
};

/**
 * @param {!Object} packet
 * @private
 */
dotprod.Game.prototype.onChatMessage_ = function(packet) {
  var playerId = packet[0];
  var message = packet[1];

  if (playerId == dotprod.model.player.Player.SYSTEM_PLAYER_ID) {
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
 * @private
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

/**
 * @param {!Object} packet
 * @private
 */
dotprod.Game.prototype.onPrizeSeedUpdated_ = function(packet) {
  var seed = packet[0];
  var timeDeltaMillis = this.protocol_.getMillisSinceServerTime(packet[1]);

  var ticks = dotprod.Timer.millisToTicks(timeDeltaMillis);
  this.prizeIndex_.onSeedUpdate(seed, ticks);
};

/**
 * @param {!Object} packet
 * @private
 */
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
  var presence = /** @type {dotprod.model.player.Player.Presence} */ (packet[1]);
  player.clearPresence(dotprod.model.player.Player.Presence.ALL);
  player.setPresence(presence);
};

/**
 * @param {!Object} packet
 * @private
 */
dotprod.Game.prototype.onFlagUpdate_ = function(packet) {
  var id = packet[0];
  var team = packet[1];
  var xTile = packet[2];
  var yTile = packet[3];

  this.flagIndex_.updateFlag(id, team, xTile, yTile);
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
