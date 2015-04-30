goog.provide('model.projectile.BombSprite');

goog.require('Labs');
goog.require('math.Vector');
goog.require('model.Effect');
goog.require('model.projectile.Projectile.Event');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.projectile.Bomb} bomb
 */
model.projectile.BombSprite = function(game, bomb) {
  goog.base(this, game.getSimulation());

  var level = bomb.getLevel();

  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {!model.projectile.Bomb}
   * @private
   */
  this.bomb_ = bomb;

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('bombs').getAnimation(level);
  this.animation_.setRepeatCount(-1);

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.bouncingAnimation_ = game.getResourceManager().getSpriteSheet('bombs').getAnimation(level + 8);
  this.bouncingAnimation_.setRepeatCount(-1);

  this.bomb_.addListener(model.projectile.Projectile.Event.EXPLODE, this.onExplode_.bind(this));

  game.getPainter().registerDrawable(graphics.Layer.PROJECTILES, this);
};
goog.inherits(model.projectile.BombSprite, model.ModelObject);

/**
 * @override
 */
model.projectile.BombSprite.prototype.advanceTime = function() {
  // First advance and drop the trail.
  if (Labs.BOMB_TRAILS) {
    var animation = this.game_.getResourceManager().getSpriteSheet('bombTrails').getAnimation(this.bomb_.getLevel());
    new model.Effect(this.game_, animation, this.bomb_.getPosition(), math.Vector.ZERO, graphics.Layer.TRAILS);
  }

  this.animation_.update();
  this.bouncingAnimation_.update();
};

/**
 * @override
 */
model.projectile.BombSprite.prototype.render = function(viewport) {
  if (!this.bomb_.isValid()) {
    this.invalidate();
    return;
  }

  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.bomb_.getPosition().getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.bomb_.getPosition().getY() - dimensions.top - this.animation_.getHeight() / 2);

  if(this.bomb_.isBouncing()) {
    this.bouncingAnimation_.render(viewport.getContext(), x, y);
  } else {
    this.animation_.render(viewport.getContext(), x, y);
  }
};

/**
 * This function gets called when a bomb explodes.
 *
 * @param {!model.projectile.Projectile} projectile
 * @param {!model.player.Player} hitPlayer
 */
model.projectile.BombSprite.prototype.onExplode_ = function(projectile, hitPlayer) {
  var animation = this.game_.getResourceManager().getSpriteSheet('explode2').getAnimation(0);
  new model.Effect(this.game_, animation, this.bomb_.getPosition(), math.Vector.ZERO);
};

/**
 * @override
 */
model.projectile.BombSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.PROJECTILES, this);
};
