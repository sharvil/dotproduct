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
goog.require('input.Mouse');
goog.require('layers.HudLayer');
goog.require('layers.NotificationLayer');
goog.require('layers.MapLayer');
goog.require('layers.RadarLayer');
goog.require('layers.Starfield');
goog.require('layers.WeaponIndicators');
goog.require('model.Map');
goog.require('model.impl.GraphicalModelObjectFactory');
goog.require('model.impl.HeadlessModelObjectFactory');
goog.require('model.player.Player.Event');
goog.require('model.Prize');
goog.require('model.Simulation');
goog.require('Notifications');
goog.require('PlayerIndex');
goog.require('PrizeIndex');
goog.require('net.Protocol');
goog.require('time.Timer');
goog.require('Viewport');
goog.require('ui.Chat');
goog.require('ui.Debug');
goog.require('ui.Disconnected');
goog.require('ui.Scoreboard');

/**
 * @constructor
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
   * @type {!input.Mouse}
   * @private
   */
  this.mouse_ = new input.Mouse();

  /**
   * @type {!HTMLCanvasElement}
   * @private
   */
  this.canvas_ = /** @type {!HTMLCanvasElement} */ (goog.dom.getElement('gv-canvas'));

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
   * @type {!ui.Chat}
   * @private
   */
  this.chatView_ = new ui.Chat(this);
  this.chatView_.addSystemMessage('Welcome to dotproduct! Select one of 8 ships with the 1-8 keys.');

  /**
   * @type {!ui.Scoreboard}
   * @private
   */
  this.scoreboardView_ = new ui.Scoreboard(this);

  /**
   * @type {!ui.Debug}
   * @private
   */
  this.debugView_ = new ui.Debug(this, this.viewport_);

  /**
   * @type {!ui.Disconnected}
   * @private
   */
  this.disconnectedView_ = new ui.Disconnected();

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

  this.protocol_.registerEventHandler(this.onConnectionLost_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.PLAYER_ENTERED, this.onPlayerEntered_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.PLAYER_LEFT, this.onPlayerLeft_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.PLAYER_POSITION, this.onPlayerPosition_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.PLAYER_DIED, this.onPlayerDied_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.CHAT_MESSAGE, this.onChatMessage_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.SHIP_CHANGE, this.onShipChanged_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.SCORE_UPDATE, this.onScoreUpdated_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.PRIZE_SEED_UPDATE, this.onPrizeSeedUpdated_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.PRIZE_COLLECTED, this.onPrizeCollected_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.SET_PRESENCE, this.onSetPresence_.bind(this));
  this.protocol_.registerPacketHandler(net.Protocol.S2CPacketType.FLAG_UPDATE, this.onFlagUpdate_.bind(this));
  this.protocol_.startGame(startingShip);

  this.viewport_.followPlayer(localPlayer);

  localPlayer.addListener(model.player.Player.Event.SHIP_CHANGE, this.onLocalPlayerShipChanged_.bind(this));
  localPlayer.addListener(model.player.Player.Event.COLLECT_PRIZE, this.onLocalPlayerCollectedPrize_.bind(this));
  localPlayer.addListener(model.player.Player.Event.DEATH, this.onLocalPlayerDied_.bind(this));

  goog.events.listen(window, goog.events.EventType.RESIZE, this.onResize_.bind(this));
  goog.events.listen(this.canvas_, goog.events.EventType.MOUSEMOVE, this.onMouseMoved_.bind(this));

  goog.events.listen(window, goog.events.EventType.FOCUS, function() { localPlayer.clearPresence(model.player.Player.Presence.AWAY); });
  goog.events.listen(window, goog.events.EventType.BLUR, function() { localPlayer.setPresence(model.player.Player.Presence.AWAY); });

  new time.Timer().setInterval(this.heartbeat_.bind(this), 100);
  html5.Notifications.requestPermission();

  // Make sure the game canvas is the right size and start rendering loop.
  goog.dom.getElement('game').style.display = 'block';
  this.onResize_();
  this.renderingLoop_();
};

/**
 * @const
 * @type {number}
 * @private
 */
Game.MAX_TICKS_PER_FRAME_ = 150;

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
 * @return {!input.Mouse}
 */
Game.prototype.getMouse = function() {
  goog.asserts.assert(!!this.mouse_, 'Mouse is null');
  return this.mouse_;
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
 * @return {!Viewport}
 */
Game.prototype.getViewport = function() {
  goog.asserts.assert(!!this.viewport_, 'Viewport is null');
  return this.viewport_;
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
  this.animationId_ = html5.AnimationFrame.request(this.renderingLoop_.bind(this));

  var curTime = goog.now();
  var timeDiff = time.Timer.millisToTicks(curTime - this.lastTime_ + this.tickResidue_);

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
  this.tickResidue_ -= time.Timer.ticksToMillis(timeDiff);
  this.lastTime_ = curTime;
};

/**
 * @private
 */
Game.prototype.onConnectionLost_ = function() {
  var self = this;
  this.renderingLoop_ = function() { self.lastTime_ = goog.now(); };
  this.disconnectedView_.show();
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
  var timeDiff = time.Timer.millisToTicks(this.protocol_.getMillisSinceServerTime(packet[0]));
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
      player.onWeaponFired(timeDiff, position, velocity, packet[8]);
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

  killee.onDeath(killer);
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

  var ticks = time.Timer.millisToTicks(timeDeltaMillis);
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

  // Remove the prize from the map if we have it in our model.
  var prize = this.prizeIndex_.getPrize(xTile, yTile);
  if (prize) {
    this.prizeIndex_.removePrize(prize);
  }

  // Let the player collect the prize, even if it wasn't on the map (this makes
  // sure the bounty gets updated correctly for remote players even if our model
  // doesn't have a prize at that location).
  player.onPrizeCollected(prize);
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
 * @param {!model.player.Player} player
 * @param {number} shipType
 */
Game.prototype.onLocalPlayerShipChanged_ = function(player, shipType) {
  this.protocol_.sendShipChange(shipType);
};

/**
 * @param {!model.player.Player} player
 * @param {!model.player.Player} killer
 * @private
 */
Game.prototype.onLocalPlayerDied_ = function(player, killer) {
  this.notifications_.addPersonalMessage('You were killed by ' + killer.getName() + '!');
  this.protocol_.sendDeath(player.getPosition(), killer);
};

/**
 * Event handler for when the local player picks up a prize. Notify the server
 * if the prize was granted by the local simulation (i.e. prize is not null).
 *
 * @param {!model.player.Player} player
 * @param {model.Prize} prize
 */
Game.prototype.onLocalPlayerCollectedPrize_ = function(player, prize) {
  if (prize) {
    this.protocol_.sendPrizeCollected(prize.getType(), prize.getX(), prize.getY());
  }

  var message;
  switch (prize.getType()) {
    case PrizeType.NONE:
      message = 'No prize for you. Sadface.';
      break;
    case PrizeType.GUN_UPGRADE:
      message = 'Guns upgraded.';
      break;
    case PrizeType.BOMB_UPGRADE:
      message = 'Bombs upgraded.';
      break;
    case PrizeType.FULL_ENERGY:
      message = 'Full charge.';
      break;
    case PrizeType.BOUNCING_BULLETS:
      message = 'Bouncing bullets.';
      break;
    case PrizeType.MULTIFIRE:
      message = 'Multifire bullets.';
      break;
    default:
      goog.asserts.assert(false, 'Unhandled prize type: ' + prize.getType());
  }

  if (message) {
    this.notifications_.addMessage(message);
  }
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
