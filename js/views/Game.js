goog.provide('Game');

goog.require('goog.asserts');
goog.require('goog.debug.ErrorHandler');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.BrowserEvent');
goog.require('goog.events.EventType');

goog.require('html5.AnimationFrame');
goog.require('html5.Notifications');

goog.require('FlagIndex');
goog.require('graphics.Painter');
goog.require('graphics.Tween');
goog.require('input.Keyboard');
goog.require('layers.HudLayer');
goog.require('layers.NotificationLayer');
goog.require('layers.MapLayer');
goog.require('layers.RadarLayer');
goog.require('layers.Starfield');
goog.require('layers.WeaponIndicators');
goog.require('model.Map');
goog.require('model.impl.GraphicalModelObjectFactory');
goog.require('model.impl.HeadlessModelObjectFactory');
goog.require('model.Prize');
goog.require('model.Simulation');
goog.require('Notifications');
goog.require('PlayerIndex');
goog.require('PrizeIndex');
goog.require('net.Protocol');
goog.require('Timer');
goog.require('Timestamp');
goog.require('Viewport');
goog.require('views.ChatView');
goog.require('views.DebugView');
goog.require('views.ScoreboardView');
goog.require('views.View');

/**
 * @constructor
 * @extends {views.View}
 * @param {!net.Protocol} protocol
 * @param {!ResourceManager} resourceManager
 * @param {!Object} settings
 * @param {!Object.<number, number>} mapData
 * @param {!Array.<!Object>} tileProperties
 */
Game = function(protocol, resourceManager, settings, mapData, tileProperties) {
  /**
   * @type {!net.Protocol}
   * @private
   */
  this.protocol_ = protocol;

  /**
   * @type {!ResourceManager}
   * @private
   */
  this.resourceManager_ = resourceManager;

  /**
   * @type {!model.ModelObjectFactory}
   * @private
   */
  this.modelObjectFactory_ = new model.impl.GraphicalModelObjectFactory();

  /**
   * @type {!model.Simulation}
   * @private
   */
  this.simulation_ = new model.Simulation(this.modelObjectFactory_);

  /**
   * @type {!graphics.Painter}
   * @private
   */
  this.painter_ = new graphics.Painter();

  /**
   * @type {!Object}
   * @private
   */
  this.settings_ = settings;

  /**
   * @type {!input.Keyboard}
   * @private
   */
  this.keyboard_ = new input.Keyboard();

  /**
   * @type {!HTMLCanvasElement}
   * @private
   */
  this.canvas_ = /** @type {!HTMLCanvasElement} */ (goog.dom.createElement('canvas'));
  this.canvas_.className = Game.CANVAS_CLASS_NAME_;

  /**
   * @type {!Viewport}
   * @private
   */
  this.viewport_ = new Viewport(this, /** @type {!CanvasRenderingContext2D} */ (this.canvas_.getContext('2d')));

  /**
   * @type {!model.Map}
   * @private
   */
  this.map_ = new model.Map(this, mapData, tileProperties);

  var startingShip = Math.floor(Math.random() * this.settings_['ships'].length);
  var localPlayer = this.modelObjectFactory_.newLocalPlayer(this, this.settings_['id'], this.settings_['name'], this.settings_['team'], startingShip);

  /**
   * @type {!PlayerIndex}
   * @private
   */
  this.playerIndex_ = new PlayerIndex(localPlayer);

  /**
   * @type {!PrizeIndex}
   * @private
   */
  this.prizeIndex_ = new PrizeIndex(this);

  /**
   * @type {!FlagIndex}
   * @private
   */
  this.flagIndex_ = new FlagIndex(this);

  /**
   * @type {!Notifications}
   * @private
   */
  this.notifications_ = new Notifications(localPlayer);

  /**
   * @type {!views.ChatView}
   * @private
   */
  this.chatView_ = new views.ChatView(this);

  /**
   * @type {!views.ScoreboardView}
   * @private
   */
  this.scoreboardView_ = new views.ScoreboardView(this);

  /**
   * @type {!views.DebugView}
   * @private
   */
  this.debugView_ = new views.DebugView(this, this.viewport_);

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

  new layers.Starfield(this);
  new layers.MapLayer(this);
  new layers.NotificationLayer(this, this.notifications_);
  new layers.RadarLayer(this);
  new layers.HudLayer(this);
  new layers.WeaponIndicators(this);

  this.protocol_.registerHandler(net.Protocol.S2CPacketType.PLAYER_ENTERED, goog.bind(this.onPlayerEntered_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.PLAYER_LEFT, goog.bind(this.onPlayerLeft_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.PLAYER_POSITION, goog.bind(this.onPlayerPosition_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.PLAYER_DIED, goog.bind(this.onPlayerDied_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.CHAT_MESSAGE, goog.bind(this.onChatMessage_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.SHIP_CHANGE, goog.bind(this.onShipChanged_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.SCORE_UPDATE, goog.bind(this.onScoreUpdated_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.PRIZE_SEED_UPDATE, goog.bind(this.onPrizeSeedUpdated_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.PRIZE_COLLECTED, goog.bind(this.onPrizeCollected_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.SET_PRESENCE, goog.bind(this.onSetPresence_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.FLAG_UPDATE, goog.bind(this.onFlagUpdate_, this));
  this.protocol_.startGame(startingShip);

  this.viewport_.followPlayer(localPlayer);

  goog.events.listen(window, goog.events.EventType.RESIZE, goog.bind(this.onResize_, this));
  goog.events.listen(this.canvas_, goog.events.EventType.MOUSEMOVE, goog.bind(this.onMouseMoved_, this));

  goog.events.listen(window, goog.events.EventType.FOCUS, function() { localPlayer.clearPresence(model.player.Player.Presence.AWAY); });
  goog.events.listen(window, goog.events.EventType.BLUR, function() { localPlayer.setPresence(model.player.Player.Presence.AWAY); });

  // TODO(sharvil): hack, come up with a better interface.
  goog.events.listen(window, goog.events.EventType.MOUSEDOWN, function() { html5.Notifications.requestPermission(); });

  Timer.setInterval(goog.bind(this.heartbeat_, this), 100);
};
goog.inherits(Game, views.View);

/**
 * @const
 * @type {number}
 * @private
 */
Game.MAX_TICKS_PER_FRAME_ = 150;

/**
 * @const
 * @type {string}
 * @private
 */
Game.CANVAS_CLASS_NAME_ = 'gv-map-canvas';

/**
 * @param {!HTMLDivElement} rootNode
 * @override
 */
Game.prototype.renderDom = function(rootNode) {
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
 * @return {!model.Simulation}
 */
Game.prototype.getSimulation = function() {
  goog.asserts.assert(!!this.simulation_, 'Simulation is null');
  return this.simulation_;
};

/**
 * @return {!graphics.Painter}
 */
Game.prototype.getPainter = function() {
  goog.asserts.assert(!!this.painter_, 'Painter is null');
  return this.painter_;
};

/**
 * @return {!net.Protocol}
 */
Game.prototype.getProtocol = function() {
  goog.asserts.assert(!!this.protocol_, 'Protocol is null');
  return this.protocol_;
};

/**
 * @return {!input.Keyboard}
 */
Game.prototype.getKeyboard = function() {
  goog.asserts.assert(!!this.keyboard_, 'Keyboard is null');
  return this.keyboard_;
};

/**
 * @return {!ResourceManager}
 */
Game.prototype.getResourceManager = function() {
  goog.asserts.assert(!!this.resourceManager_, 'Resource maanger is null');
  return this.resourceManager_;
};

/**
 * @return {!Object}
 */
Game.prototype.getSettings = function() {
  goog.asserts.assert(!!this.settings_, 'Settings is null');
  return this.settings_;
};

/**
 * @return {!model.Map}
 */
Game.prototype.getMap = function() {
  goog.asserts.assert(!!this.map_, 'Map is null');
  return this.map_;
};

/**
 * @return {!PlayerIndex}
 */
Game.prototype.getPlayerIndex = function() {
  goog.asserts.assert(!!this.playerIndex_, 'Player index is null');
  return this.playerIndex_;
};

/**
 * @return {!PrizeIndex}
 */
Game.prototype.getPrizeIndex = function() {
  goog.asserts.assert(!!this.prizeIndex_, 'Prize index is null');
  return this.prizeIndex_;
};

/**
 * @return {!FlagIndex}
 */
Game.prototype.getFlagIndex = function() {
  goog.asserts.assert(!!this.flagIndex_, 'Flag index is null');
  return this.flagIndex_;
};

/**
 * @return {!model.ModelObjectFactory}
 */
Game.prototype.getModelObjectFactory = function() {
  goog.asserts.assert(!!this.modelObjectFactory_, 'Model object factory is null');
  return this.modelObjectFactory_;
};

/**
 * @private
 */
Game.prototype.heartbeat_ = function() {
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
Game.prototype.renderingLoop_ = function() {
  this.animationId_ = html5.AnimationFrame.request(goog.bind(this.renderingLoop_, this));

  var curTime = goog.now();
  var timeDiff = Timer.millisToTicks(curTime - this.lastTime_ + this.tickResidue_);

  timeDiff = Math.min(timeDiff, Game.MAX_TICKS_PER_FRAME_);

  for (var i = 0; i < timeDiff; ++i) {
    this.simulation_.advanceTime();
  }

  this.viewport_.update();

  for (var i = 0; i < timeDiff; ++i) {
    graphics.Tween.advanceAll();
  }

  this.painter_.render(this.viewport_);

  this.scoreboardView_.update();
  this.debugView_.update();

  this.tickResidue_ += curTime - this.lastTime_;
  this.tickResidue_ -= Timer.ticksToMillis(timeDiff);
  this.lastTime_ = curTime;
};

/**
 * @param {!Array} packet
 * @private
 */
Game.prototype.onPlayerEntered_ = function(packet) {
  var id = packet[0];
  var name = packet[1];
  var team = packet[2];
  var isAlive = packet[3];
  var ship = packet[4];
  var bounty = packet[5];
  var presence = /** @type {!model.player.Player.Presence} */ (packet[6]);

  var player = this.modelObjectFactory_.newRemotePlayer(this, id, name, team, isAlive, ship, bounty);
  player.setPresence(presence);
  this.playerIndex_.addPlayer(player);

  this.notifications_.addEnterMessage('Player entered: ' + name);
};

/**
 * @param {!Array} packet
 * @private
 */
Game.prototype.onPlayerLeft_ = function(packet) {
  var id = packet[0];
  var player = this.playerIndex_.findById(id);
  if (player) {
    this.playerIndex_.removePlayer(player);
    this.notifications_.addEnterMessage('Player left: ' + player.getName());
  }
};

/**
 * @param {!Array} packet
 * @private
 */
Game.prototype.onPlayerPosition_ = function(packet) {
  var timeDiff = Timer.millisToTicks(this.protocol_.getMillisSinceServerTime(packet[0]));
  var id = packet[1];
  var angle = packet[2];
  var position = new math.Vector(packet[3], packet[4]);
  var velocity = new math.Vector(packet[5], packet[6]);
  var isSafe = packet[7];

  timeDiff = Math.min(timeDiff, 150);

  var player = this.playerIndex_.findById(id);
  if (player) {
    player.onPositionUpdate(timeDiff, angle, position, velocity, isSafe);
    if (packet.length > 8) {
      player.onWeaponFired(timeDiff, packet[8]);
    }
  }
};

/**
 * @param {!Array} packet
 * @private
 */
Game.prototype.onPlayerDied_ = function(packet) {
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
 * @param {!Array} packet
 * @private
 */
Game.prototype.onShipChanged_ = function(packet) {
  var player = this.playerIndex_.findById(packet[0]);
  var ship = packet[1];

  if (player) {
    player.setShip(ship);
  }
};

/**
 * @param {!Array} packet
 * @private
 */
Game.prototype.onChatMessage_ = function(packet) {
  var playerId = packet[0];
  var message = packet[1];

  if (playerId == model.player.Player.SYSTEM_PLAYER_ID) {
    this.chatView_.addSystemMessage(message);
  } else {
    var player = this.playerIndex_.findById(packet[0]);
    if (player) {
      this.chatView_.addMessage(player, message);
    }
  }
};

/**
 * @param {!Array} packet
 * @private
 */
Game.prototype.onScoreUpdated_ = function(packet) {
  var player = this.playerIndex_.findById(packet[0]);
  var points = packet[1];
  var wins = packet[2];
  var losses = packet[3];

  if(player) {
    player.onScoreUpdate(points, wins, losses);
  }
};

/**
 * @param {!Array} packet
 * @private
 */
Game.prototype.onPrizeSeedUpdated_ = function(packet) {
  var seed = packet[0];
  var timeDeltaMillis = this.protocol_.getMillisSinceServerTime(packet[1]);

  var ticks = Timer.millisToTicks(timeDeltaMillis);
  this.prizeIndex_.onSeedUpdate(seed, ticks);
};

/**
 * @param {!Array} packet
 * @private
 */
Game.prototype.onPrizeCollected_ = function(packet) {
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
 * @param {!Array} packet
 * @private
 */
Game.prototype.onSetPresence_ = function(packet) {
  var player = this.playerIndex_.findById(packet[0]);
  var presence = /** @type {model.player.Player.Presence} */ (packet[1]);
  player.clearPresence(model.player.Player.Presence.ALL);
  player.setPresence(presence);
};

/**
 * @param {!Array} packet
 * @private
 */
Game.prototype.onFlagUpdate_ = function(packet) {
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
Game.prototype.onMouseMoved_ = function(event) {
  if (event.offsetX < 10) {
    this.scoreboardView_.show();
  } else {
    this.scoreboardView_.hide();
  }
};

/**
 * @private
 */
Game.prototype.onResize_ = function() {
  this.canvas_.width = window.innerWidth - this.canvas_.parentNode.offsetLeft;
  this.canvas_.height = window.innerHeight - this.canvas_.parentNode.offsetTop;
};
