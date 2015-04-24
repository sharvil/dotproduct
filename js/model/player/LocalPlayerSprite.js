goog.provide('model.player.LocalPlayerSprite');

goog.require('goog.array');
goog.require('Labs');
goog.require('model.player.LocalPlayer');
goog.require('model.player.Player.Event');
goog.require('model.player.PlayerSprite');
goog.require('graphics.Drawable');
goog.require('graphics.Layer');
goog.require('time.Timer');

/**
 * @constructor
 * @extends {model.player.LocalPlayer}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {number} ship
 */
model.player.LocalPlayerSprite = function(game, id, name, team, ship) {
  goog.base(this, game, id, name, team, ship);

  /**
   * @type {!ResourceManager}
   * @private
   */
  this.resourceManager_ = game.getResourceManager();

  var self = this;
  this.addListener(model.player.Player.Event.COLLECT_PRIZE, function() {
    self.resourceManager_.playSound('prize');
  });

  this.addListener(model.player.Player.Event.BOUNCE, function(player) {
    if (player.getVelocity().magnitude() > 1) {
      self.resourceManager_.playSound('bounce');
    }
  });

  this.addListener(model.player.Player.Event.DEATH, function(player, killer) {
    model.player.PlayerSprite.prototype.death_.call(player, killer);
  });

  this.addListener(model.player.Player.Event.RESPAWN, function(player) {
    model.player.PlayerSprite.prototype.respawn_.call(player);
  });

  game.getPainter().registerDrawable(graphics.Layer.LOCAL_PLAYER, this);
};
goog.inherits(model.player.LocalPlayerSprite, model.player.LocalPlayer);

/**
 * @override
 */
model.player.LocalPlayerSprite.prototype.render = function(viewport) {
  if (!this.isValid()) {
    this.game_.getPainter().unregisterDrawable(graphics.Layer.LOCAL_PLAYER, this);
    return;
  }

  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();

  if (!this.isAlive()) {
    var millis = window.time.Timer.ticksToMillis(this.respawnTimer_);
    var seconds = Math.floor(millis / 1000);
    var tenths = Math.floor((millis % 1000) / 100);
    var time = seconds + '.' + tenths;
    context.save();
      context.font = Font.playerFont().toString();
      context.fillStyle = Palette.friendColor();
      context.fillText(time, dimensions.width / 2, dimensions.height / 2);
    context.restore();
    return;
  }

  goog.array.forEach(this.exhaust_, function(e) {
    e.render(viewport);
  });

  model.player.PlayerSprite.prototype.render.call(this, viewport);

  var damageOverlay = this.resourceManager_.getImage('ship' + this.ship_ + 'Red');
  var x = Math.floor((dimensions.width - damageOverlay.getTileWidth()) / 2);
  var y = Math.floor((dimensions.height - damageOverlay.getTileHeight()) / 2);
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * damageOverlay.getNumTiles());

  if (Labs.DAMAGE_OVERLAY) {
    context.save();
      context.globalAlpha = 0.7 * (1 - (this.energy_ / this.maxEnergy_));
      context.globalCompositeOperation = 'lighter';
      damageOverlay.render(context, x, y, tileNum);
    context.restore();
  }

  if (this.isSafe_()) {
    context.save();
      context.font = Font.playerFont().toString();
      context.fillStyle = Palette.friendColor();
      context.textAlign = 'center';
      context.textBaseline = 'top';
      context.fillText('Safety - weapons disabled.', x, y - 40);
    context.restore();
  }
};
