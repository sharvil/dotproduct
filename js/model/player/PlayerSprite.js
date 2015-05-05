goog.provide('model.player.PlayerSprite');

goog.require('model.Effect');
goog.require('math.Vector');
goog.require('model.player.Player.Event');

/**
 * @constructor
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.player.Player} player
 */
model.player.PlayerSprite = function(game, player, layer) {
  /**
   * @type {!Game}
   * @protected
   */
  this.game_ = game;

  /**
   * @type {!model.player.Player}
   * @protected
   */
  this.player_ = player;

  /**
   * @type {!graphics.Layer}
   * @protected
   */
  this.layer_ = layer;

  player.addListener(model.player.Player.Event.DEATH, this.death_.bind(this));
  player.addListener(model.player.Player.Event.RESPAWN, this.respawn_.bind(this));

  game.getPainter().registerDrawable(layer, this);
};

/**
 * @param {!Viewport} viewport
 */
model.player.PlayerSprite.prototype.render = function(viewport) {
  if (!this.player_.isValid()) {
    this.game_.getPainter().unregisterDrawable(this.layer_, this);
    return;
  }

  if (!this.player_.isAlive()) {
    return;
  }

  model.player.PlayerSprite.renderPlayer(this.game_, viewport, this.player_, this.player_.getDirection(), this.player_.getPosition());
};

/**
 * This function renders the given |player| with an override for |direction| and
 * |position|. It's used to share player rendering code between PlayerSprite
 * and DecoySprite.
 *
 * @param {!Game} game
 * @param {!Viewport} viewport
 * @param {!model.player.Player} player
 * @param {number} direction
 * @param {!math.Vector} position
 */
model.player.PlayerSprite.renderPlayer = function(game, viewport, player, direction, position) {
  var resourceManager = game.getResourceManager();
  var shipImage = resourceManager.getImage('ship' + player.getShip());

  var dimensions = viewport.getDimensions();
  var context = viewport.getContext();

  var x = Math.floor(position.getX() - dimensions.left - shipImage.getTileWidth() / 2);
  var y = Math.floor(position.getY() - dimensions.top - shipImage.getTileHeight() / 2);

  shipImage.render(context, x, y, direction);

  // Draw a label for the player's name.
  var name = player.getName();
  var bounty = player.getBounty();
  var isFriend = player.isFriend(game.getPlayerIndex().getLocalPlayer());
  context.save();
    context.font = Font.playerFont().toString();
    context.fillStyle = isFriend ? Palette.friendColor() : Palette.foeColor();
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(name + '(' + bounty + ')', x + shipImage.getTileWidth() / 2, y + shipImage.getTileHeight());
  context.restore();

  // Draw a presence indicator for the player if applicable.
  var presenceImage = null;
  if (player.hasPresence(model.player.Player.Presence.AWAY)) {
    presenceImage = resourceManager.getImage('presenceAway');
  } else if (player.hasPresence(model.player.Player.Presence.TYPING)) {
    presenceImage = resourceManager.getImage('presenceTyping');
  }

  if (presenceImage) {
    var speechX = x + shipImage.getTileWidth() - Math.floor(presenceImage.getTileWidth() / 2);
    var speechY = y - Math.floor(presenceImage.getTileHeight() / 2);
    presenceImage.render(context, speechX, speechY);
  }
};

/**
 * Called when the player this sprite represents gets killed.
 *
 * @param {!model.player.Player} killee
 * @param {!model.player.Player} killer
 * @private
 */
model.player.PlayerSprite.prototype.death_ = function(killee, killer) {
  var position = killee.getPosition();
  var velocity = killee.getVelocity();

  var resourceManager = this.game_.getResourceManager();
  var ensemble = resourceManager.getSpriteSheet('explode1');
  new model.Effect(this.game_, ensemble.getAnimation(0), position, velocity);

  ensemble = resourceManager.getSpriteSheet('ship' + killee.getShip() + '_junk');
  for (var i = 0; i < ensemble.getNumAnimations(); ++i) {
    var animation = ensemble.getAnimation(i);
    var deltaVelocity = math.Vector.fromPolar(Math.random() * 2, Math.random() * 2 * Math.PI);
    new model.Effect(this.game_, animation, position, velocity.add(deltaVelocity));
  }

  if (this.game_.getViewport().contains(position)) {
    resourceManager.playSound('explodeShip');
  }
};

/**
 * Called when the player this sprite represents respawns.
 *
 * @param {!model.player.Player} player
 * @private
 */
model.player.PlayerSprite.prototype.respawn_ = function(player) {
  var resourceManager = this.game_.getResourceManager();
  var animation = resourceManager.getSpriteSheet('warp').getAnimation(0);
  new model.Effect(this.game_, animation, player.getPosition(), math.Vector.ZERO);
};
