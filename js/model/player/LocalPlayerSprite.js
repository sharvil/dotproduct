/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.model.player.LocalPlayerSprite');

goog.require('goog.array');
goog.require('dotprod.model.player.LocalPlayer');
goog.require('dotprod.model.player.PlayerSprite');
goog.require('dotprod.graphics.Drawable');
goog.require('dotprod.graphics.Layer');

/**
 * @constructor
 * @extends {dotprod.model.player.LocalPlayer}
 * @implements {dotprod.graphics.Drawable}
 * @param {!dotprod.Game} game
 * @param {string} id
 * @param {string} name
 * @param {number} team
 * @param {number} ship
 */
dotprod.model.player.LocalPlayerSprite = function(game, id, name, team, ship) {
  goog.base(this, game, id, name, team, ship);

  game.getPainter().registerDrawable(dotprod.graphics.Layer.LOCAL_PLAYER, this);
};
goog.inherits(dotprod.model.player.LocalPlayerSprite, dotprod.model.player.LocalPlayer);

/**
 * @override
 */
dotprod.model.player.LocalPlayerSprite.prototype.respawn = dotprod.model.player.PlayerSprite.prototype.respawn;

/**
 * @override
 */
dotprod.model.player.LocalPlayerSprite.prototype.onDeath = dotprod.model.player.PlayerSprite.prototype.onDeath;

/**
 * @override
 */
dotprod.model.player.LocalPlayerSprite.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();

  if (!this.isAlive()) {
    var millis = dotprod.Timer.ticksToMillis(this.respawnTimer_);
    var seconds = Math.floor(millis / 1000);
    var tenths = Math.floor((millis % 1000) / 100);
    var time = seconds + '.' + tenths;
    context.save();
      context.font = dotprod.FontFoundry.playerFont();
      context.fillStyle = dotprod.Palette.friendColor();
      context.fillText(time, dimensions.width / 2, dimensions.height / 2);
    context.restore();
    return;
  }

  goog.array.forEach(this.exhaust_, function(e) {
    e.render(viewport);
  });

  dotprod.model.player.PlayerSprite.prototype.render.call(this, viewport);

  var damageOverlay = this.game_.getResourceManager().getImage('ship' + this.ship_ + 'Red');
  var x = Math.floor((dimensions.width - damageOverlay.getTileWidth()) / 2);
  var y = Math.floor((dimensions.height - damageOverlay.getTileHeight()) / 2);
  var tileNum = Math.floor(this.angleInRadians_ / (2 * Math.PI) * damageOverlay.getNumTiles());

  context.save();
    context.globalAlpha = 0.7 * (1 - (this.energy_ / this.maxEnergy_));
    context.globalCompositeOperation = 'lighter';
    damageOverlay.render(context, x, y, tileNum);
  context.restore();
};

/**
 * @override
 */
dotprod.model.player.LocalPlayerSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(dotprod.graphics.Layer.LOCAL_PLAYER, this);
};
