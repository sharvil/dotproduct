goog.provide('layers.WeaponIndicators');

goog.require('goog.dom');
goog.require('goog.events.KeyNames');
goog.require('graphics.Drawable');
goog.require('input.Keymap');
goog.require('math.Rect');

/**
 * @constructor
 * @param {!Game} game
 * @implements {graphics.Drawable}
 */
layers.WeaponIndicators = function(game) {
  /**
   * @type {!model.player.LocalPlayer}
   * @private
   */
  this.localPlayer_ = game.getPlayerIndex().getLocalPlayer();

  /**
   * @type {!input.Mouse}
   * @private
   */
  this.mouse_ = game.getMouse();

  /**
   * @type {!graphics.Image}
   * @private
   */
  this.icons_ = game.getResourceManager().getImage('icons');

  /**
   * @type {!HTMLDivElement}
   * @private
   */
  this.tooltip_ = /** @type {!HTMLDivElement} */ (goog.dom.getElement('tt'));

  game.getPainter().registerDrawable(graphics.Layer.HUD, this);
};

/**
 * @type {string}
 * @private
 * @const
 */
layers.WeaponIndicators.TOOLTIP_HIDE_CLASS_NAME_ = 'tt-hide';

/**
 * @override
 */
layers.WeaponIndicators.prototype.render = function(viewport) {
  var context = viewport.getContext();
  var dimensions = viewport.getDimensions();

  // TODO(sharvil): don't reach into Player's private members.
  var gunLevel = this.localPlayer_.gun_.getLevel();
  var bombLevel = this.localPlayer_.bombBay_.getLevel();
  var bursts = this.localPlayer_.burst_.getCount();
  var numIndicators = 2;
  var padding = 1;

  var width = this.icons_.getTileWidth();
  var height = this.icons_.getTileHeight();
  var top = Math.floor((dimensions.height - (numIndicators * height + (numIndicators - 1) * padding)) / 2);
  var left = dimensions.width - width;

  this.tooltip_.classList.add(layers.WeaponIndicators.TOOLTIP_HIDE_CLASS_NAME_);

  var label = 'Guns: ' + goog.events.KeyNames[input.Keymap.FIRE_GUN];
  this.renderLeveledWeapon_(context, new math.Rect(left, top, width, height), gunLevel, 0, label);

  top += padding + height;

  label = 'Bombs: ' + goog.events.KeyNames[input.Keymap.FIRE_BOMB] + '\n';
  label += 'Mines: ' + goog.events.KeyNames[input.Keymap.FIRE_MINE];
  this.renderLeveledWeapon_(context, new math.Rect(left, top, width, height), bombLevel, 18, label);

  label = 'Burst: ' + goog.events.KeyNames[input.Keymap.FIRE_BURST];
  this.renderConsumableWeapon_(context, new math.Rect(0, top, width, height), bursts, 30, label);
};

/**
 * @param {!CanvasRenderingContext2D} context
 * @param {!math.Rect} rect
 * @param {number} level
 * @param {number} tileNum
 * @param {string} label
 */
layers.WeaponIndicators.prototype.renderLeveledWeapon_ = function(context, rect, level, tileNum, label) {
  var x = rect.x();
  var y = rect.y();

  if (level >= 0) {
    tileNum += level;
    if (this.mouse_.isHovering(rect)) {
      this.tooltip_.classList.remove(layers.WeaponIndicators.TOOLTIP_HIDE_CLASS_NAME_);
      this.tooltip_.style.top = rect.y() + 'px';
      this.tooltip_.style.right = rect.width() + 'px';
      this.tooltip_.style.left = '';
      this.tooltip_.innerText = label;
    }
  } else {
    x += rect.width() - 4;
  }

  this.icons_.render(context, x, y, tileNum);
};

layers.WeaponIndicators.prototype.renderConsumableWeapon_ = function(context, rect, count, tileNum, label) {
  var x = rect.x();
  var y = rect.y();

  if (count <= 0) {
    x -= rect.width() - 4;
  } else if (this.mouse_.isHovering(rect)) {
    this.tooltip_.classList.remove(layers.WeaponIndicators.TOOLTIP_HIDE_CLASS_NAME_);
    this.tooltip_.style.top = rect.y() + 'px';
    this.tooltip_.style.left = rect.width() + 'px';
    this.tooltip_.style.right = '';
    this.tooltip_.innerText = label;
  }

  this.icons_.render(context, x, y, tileNum);
};
