goog.provide('model.player.PlayerSprite');

goog.require('model.Effect');
goog.require('math.Vector');

/**
 * @constructor
 */
model.player.PlayerSprite = goog.abstractMethod;

/**
 * @param {number} angle
 * @param {!math.Vector} position
 * @param {!math.Vector} velocity
 */
model.player.PlayerSprite.prototype.respawn = function(angle, position, velocity) {
  goog.base(this, 'respawn', angle, position, velocity);

  var resourceManager = this.game_.getResourceManager();
  var animation = resourceManager.getSpriteSheet('warp').getAnimation(0);
  var effect = new model.Effect(this.game_, animation, this.position_, math.Vector.ZERO);
};

model.player.PlayerSprite.prototype.onDeath = function() {
  goog.base(this, 'onDeath');

  var resourceManager = this.game_.getResourceManager();
  var ensemble = resourceManager.getSpriteSheet('explode1');
  var effect = new model.Effect(this.game_, ensemble.getAnimation(0), this.position_, this.velocity_);

  ensemble = resourceManager.getSpriteSheet('ship' + this.ship_ + '_junk');
  for (var i = 0; i < ensemble.getNumAnimations(); ++i) {
    var animation = ensemble.getAnimation(i);
    var deltaVelocity = math.Vector.fromPolar(Math.random() * 2, Math.random() * 2 * Math.PI);
    var piece = new model.Effect(this.game_, animation, this.position_, this.velocity_.add(deltaVelocity));
  }
};

/**
 * @param {!Viewport} viewport
 */
model.player.PlayerSprite.prototype.render = function(viewport) {
  if (!this.isAlive()) {
    return;
  }

  var resourceManager = this.game_.getResourceManager();
  var shipImage = resourceManager.getImage('ship' + this.ship_);
  var awayImage = resourceManager.getImage('presenceAway');
  var typingImage = resourceManager.getImage('presenceTyping');

  var localPlayer = this.game_.getPlayerIndex().getLocalPlayer();
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * shipImage.getNumTiles());
  var dimensions = viewport.getDimensions();
  var context = viewport.getContext();

  var x = Math.floor(this.position_.getX() - dimensions.left - shipImage.getTileWidth() / 2);
  var y = Math.floor(this.position_.getY() - dimensions.top - shipImage.getTileHeight() / 2);

  shipImage.render(context, x, y, tileNum);

  var presenceImage = null;
  if (this.hasPresence(model.player.Player.Presence.AWAY)) {
    presenceImage = awayImage;
  } else if (this.hasPresence(model.player.Player.Presence.TYPING)) {
    presenceImage = typingImage;
  }

  if (presenceImage) {
    var speechX = x + shipImage.getTileWidth() - Math.floor(presenceImage.getTileWidth() / 2);
    var speechY = y - Math.floor(presenceImage.getTileHeight() / 2);
    presenceImage.render(context, speechX, speechY);
  }

  context.save();
    context.font = Font.playerFont();
    context.fillStyle = this.isFriend(localPlayer) ? Palette.friendColor() : Palette.foeColor();
    context.textAlign = 'center';
    context.textBaseline = 'top';
    context.fillText(this.name_ + '(' + this.bounty_ + ')', x + shipImage.getTileWidth() / 2, y + shipImage.getTileHeight());
  context.restore();
};
