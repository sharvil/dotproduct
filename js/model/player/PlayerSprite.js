goog.provide('model.player.PlayerSprite');

goog.require('model.Effect');
goog.require('math.Vector');

/**
 * @constructor
 */
model.player.PlayerSprite = goog.abstractMethod;

model.player.PlayerSprite.prototype.death_ = function(killer) {
  var position = this.player_.getPosition();
  var velocity = this.player_.getVelocity();

  var resourceManager = this.game_.getResourceManager();
  var ensemble = resourceManager.getSpriteSheet('explode1');
  new model.Effect(this.game_, ensemble.getAnimation(0), position, velocity);

  ensemble = resourceManager.getSpriteSheet('ship' + this.player_.getShip() + '_junk');
  for (var i = 0; i < ensemble.getNumAnimations(); ++i) {
    var animation = ensemble.getAnimation(i);
    var deltaVelocity = math.Vector.fromPolar(Math.random() * 2, Math.random() * 2 * Math.PI);
    new model.Effect(this.game_, animation, position, velocity.add(deltaVelocity));
  }

  if (this.game_.getViewport().contains(position)) {
    resourceManager.playSound('explodeShip');
  }
};

model.player.PlayerSprite.prototype.respawn_ = function() {
  var resourceManager = this.game_.getResourceManager();
  var animation = resourceManager.getSpriteSheet('warp').getAnimation(0);
  new model.Effect(this.game_, animation, this.player_.getPosition(), math.Vector.ZERO);
};

/**
 * @param {!Viewport} viewport
 */
model.player.PlayerSprite.prototype.render = function(viewport) {
  if (!this.player_.isValid()) {
    this.game_.getPainter().unregisterDrawable(graphics.Layer.PLAYERS, this);
    return;
  }

  if (!this.player_.isAlive()) {
    return;
  }

  var resourceManager = this.game_.getResourceManager();
  var shipImage = resourceManager.getImage('ship' + this.player_.getShip());
  var awayImage = resourceManager.getImage('presenceAway');
  var typingImage = resourceManager.getImage('presenceTyping');

  var tileNum = this.player_.getDirection();
  var dimensions = viewport.getDimensions();
  var context = viewport.getContext();
  var position = this.player_.getPosition();

  var x = Math.floor(position.getX() - dimensions.left - shipImage.getTileWidth() / 2);
  var y = Math.floor(position.getY() - dimensions.top - shipImage.getTileHeight() / 2);

  shipImage.render(context, x, y, tileNum);

  var presenceImage = null;
  if (this.player_.hasPresence(model.player.Player.Presence.AWAY)) {
    presenceImage = awayImage;
  } else if (this.player_.hasPresence(model.player.Player.Presence.TYPING)) {
    presenceImage = typingImage;
  }

  if (presenceImage) {
    var speechX = x + shipImage.getTileWidth() - Math.floor(presenceImage.getTileWidth() / 2);
    var speechY = y - Math.floor(presenceImage.getTileHeight() / 2);
    presenceImage.render(context, speechX, speechY);
  }

  // Draw a label for the player's name.
  var name = this.player_.getName();
  var bounty = this.player_.getBounty();
  var isFriend = this.player_.isFriend(this.game_.getPlayerIndex().getLocalPlayer());
  context.save();
    context.font = Font.playerFont().toString();
    context.fillStyle = isFriend ? Palette.friendColor() : Palette.foeColor();
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(name + '(' + bounty + ')', x + shipImage.getTileWidth() / 2, y + shipImage.getTileHeight());
  context.restore();
};
