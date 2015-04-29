goog.provide('model.projectile.MineSprite');

goog.require('math.Vector');
goog.require('model.Effect');
goog.require('model.projectile.Projectile.Event');
goog.require('graphics.Layer');

/**
 * @constructor
 * @extends {model.ModelObject}
 * @implements {graphics.Drawable}
 * @param {!Game} game
 * @param {!model.projectile.Mine} mine
 */
model.projectile.MineSprite = function(game, mine) {
  goog.base(this, game.getSimulation());

  /**
   * @type {!Game}
   * @private
   */
  this.game_ = game;

  /**
   * @type {model.projectile.Mine}
   * @private
   */
  this.mine_ = mine;

  /**
   * @type {!graphics.Animation}
   * @private
   */
  this.animation_ = game.getResourceManager().getSpriteSheet('mines').getAnimation(mine.getLevel());
  this.animation_.setRepeatCount(-1);

  this.mine_.addListener(model.projectile.Projectile.Event.EXPLODE, this.onExplode_.bind(this));

  game.getPainter().registerDrawable(graphics.Layer.PROJECTILES, this);
};
goog.inherits(model.projectile.MineSprite, model.ModelObject);

/**
 * @override
 */
model.projectile.MineSprite.prototype.advanceTime = function() {
  this.animation_.update();
};

/**
 * @override
 */
model.projectile.MineSprite.prototype.render = function(viewport) {
  if (!this.mine_.isValid()) {
    this.invalidate();
    return;
  }

  var dimensions = viewport.getDimensions();
  var x = Math.floor(this.mine_.getPosition().getX() - dimensions.left - this.animation_.getWidth() / 2);
  var y = Math.floor(this.mine_.getPosition().getY() - dimensions.top - this.animation_.getHeight() / 2);

  this.animation_.render(viewport.getContext(), x, y);
};

/**
 * This function gets called when a mine explodes.
 *
 * @param {!model.projectile.Projectile} projectile
 * @param {!model.player.Player} hitPlayer
 */
model.projectile.MineSprite.prototype.onExplode_ = function(projectile, hitPlayer) {
  // Add an explosion animation.
  var animation = this.game_.getResourceManager().getSpriteSheet('explode2').getAnimation(0);
  new model.Effect(this.game_, animation, this.mine_.getPosition(), math.Vector.ZERO);
};

/**
 * @override
 */
model.projectile.MineSprite.prototype.onInvalidate_ = function() {
  goog.base(this, 'onInvalidate_');

  this.game_.getPainter().unregisterDrawable(graphics.Layer.PROJECTILES, this);
};
