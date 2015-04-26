goog.provide('model.player.LocalPlayerSprite');

goog.require('goog.array');
goog.require('model.player.Player.Event');
goog.require('model.player.PlayerSprite');
goog.require('graphics.Layer');
goog.require('time.Timer');

/**
 * @constructor
 * @extends {model.player.PlayerSprite}
 * @param {!Game} game
 * @param {!model.player.LocalPlayer} localPlayer
 */
model.player.LocalPlayerSprite = function(game, localPlayer) {
  goog.base(this, game, localPlayer, graphics.Layer.LOCAL_PLAYER);

  /**
   * @type {!ResourceManager}
   * @private
   */
  this.resourceManager_ = game.getResourceManager();

  localPlayer.addListener(model.player.Player.Event.COLLECT_PRIZE, this.collectPrize_.bind(this));
  localPlayer.addListener(model.player.Player.Event.BOUNCE, this.bounce_.bind(this));
};
goog.inherits(model.player.LocalPlayerSprite, model.player.PlayerSprite);

/**
 * @override
 */
model.player.LocalPlayerSprite.prototype.render = function(viewport) {
  if (!this.player_.isValid()) {
    this.game_.getPainter().unregisterDrawable(this.layer_, this);
    return;
  }

  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();

  if (!this.player_.isAlive()) {
    var millis = window.time.Timer.ticksToMillis(this.player_.getRespawnTimer());
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

  goog.array.forEach(this.player_.getExhaust(), function(e) {
    e.render(viewport);
  });

  goog.base(this, 'render', viewport);

  var x = Math.floor(dimensions.width / 2);
  var y = Math.floor(dimensions.height / 2);
  if (this.player_.isSafe()) {
    context.save();
      context.font = Font.playerFont().toString();
      context.fillStyle = Palette.friendColor();
      context.textAlign = 'center';
      context.textBaseline = 'top';
      context.fillText('Safety - weapons disabled.', x, y - 50);
    context.restore();
  }
};

/**
 * Called when the local player collects a prize.
 *
 * @param {!model.player.Player} player
 * @param {model.Prize} prize
 * @private
 */
model.player.LocalPlayerSprite.prototype.collectPrize_ = function(player, prize) {
  this.resourceManager_.playSound('prize');
};

/**
 * Called when the local player bounces off a wall.
 *
 * @param {!model.player.Player} player
 * @private
 */
model.player.LocalPlayerSprite.prototype.bounce_ = function(player) {
  // If the player was speeding, play a sound on the bounce.
  if (player.getVelocity().magnitude() > 1) {
    this.resourceManager_.playSound('bounce');
  }
};
