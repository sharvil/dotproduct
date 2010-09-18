/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Game');

goog.require('goog.debug.ErrorHandler');
goog.require('goog.dom');
goog.require('dotprod.Camera');
goog.require('dotprod.entities.LocalPlayer');
goog.require('dotprod.entities.RemotePlayer');
goog.require('dotprod.input.Keyboard');
goog.require('dotprod.layers.NotificationLayer');
goog.require('dotprod.layers.MapLayer');
goog.require('dotprod.layers.ProjectileLayer');
goog.require('dotprod.layers.ShipLayer');
goog.require('dotprod.layers.StarLayer');
goog.require('dotprod.Map');
goog.require('dotprod.Notifications');
goog.require('dotprod.PlayerIndex');
goog.require('dotprod.ProjectileIndex');
goog.require('dotprod.Protocol');
goog.require('dotprod.ResourceManager');
goog.require('dotprod.Timer');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Protocol} protocol
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
  this.canvas_.width = 800;
  this.canvas_.height = 600;

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
   * @type {!dotprod.ProjectileIndex}
   * @private
   */
  this.projectileIndex_ = new dotprod.ProjectileIndex();

  /**
   * @type {!dotprod.PlayerIndex}
   * @private
   */
  this.playerIndex_ = new dotprod.PlayerIndex();
  this.playerIndex_.addPlayer(new dotprod.entities.LocalPlayer(this, this.camera_, this.projectileIndex_, this.settings_['name']));

  /**
   * @type {!dotprod.Notifications}
   * @private
   */
  this.notifications_ = new dotprod.Notifications();

  /**
   * @type {!Array.<dotprod.layers.Layer>}
   * @private
   */
  this.layers_ = [
      new dotprod.layers.StarLayer(),
      new dotprod.layers.MapLayer(this, this.map_),
      new dotprod.layers.ProjectileLayer(this.map_, this.playerIndex_, this.projectileIndex_),
      new dotprod.layers.ShipLayer(this.map_, this.playerIndex_),
      new dotprod.layers.NotificationLayer(this.notifications_)
    ];

  /**
   * @type {number}
   * @private
   */
  this.intervalTimer_ = 0;

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
  this.protocol_.startGame();
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
};

dotprod.Game.prototype.start = function() {
  this.lastTime_ = goog.now();
  this.tickResidue_ = 0;
  this.intervalTimer_ = dotprod.Timer.setInterval(goog.bind(this.renderingLoop_, this), 1);
};

dotprod.Game.prototype.stop = function() {
  dotprod.Timer.clearInterval(this.intervalTimer_);
  this.intervalTimer_ = 0;
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
  this.playerIndex_.addPlayer(new dotprod.entities.RemotePlayer(this, name, 0));
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

  var player = this.playerIndex_.findByName(name);
  if (player) {
    player.onPositionUpdate(timeDiff, angle, position, velocity);
    if (packet.length > 7) {
      var bulletPos = new dotprod.Vector(packet[7], packet[8]);
      var bulletVel = new dotprod.Vector(packet[9], packet[10]);
      this.projectileIndex_.addProjectile(player, new dotprod.entities.Bullet(player, bulletPos, bulletVel));
    }
  }
};

/**
 * @param {!Object} packet
 */
dotprod.Game.prototype.onPlayerDied_ = function(packet) {
  var timestamp = packet[0];
  var killee = this.playerIndex_.findByName(packet[1]);
  var killer = this.playerIndex_.findByName(packet[2]);

  if (!killer || !killee) {
    return;
  }

  killee.onDeath();
  this.notifications_.addMessage(killee.getName() + ' killed by '+ killer.getName());
};
