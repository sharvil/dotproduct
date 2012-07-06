/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.Palette');

/**
 * @return {string}
 */
dotprod.Palette.borderColor = function() {
  return '#222';
};

/**
 * @return {string}
 */
dotprod.Palette.radarBgColor = function() {
  return 'rgba(0, 20, 0, 0.65)';
};

/**
 * @return {string}
 */
dotprod.Palette.radarTileColor = function() {
  return 'rgba(255, 255, 255, 0.3)';
};

/**
 * @return {string}
 */
dotprod.Palette.foeColor = function() {
  return 'rgba(198, 198, 247, 1)';
};

/**
 * @return {string}
 */
dotprod.Palette.chatColor = function() {
  return 'rgba(190, 190, 190, 1)';
};

/**
 * @param {number=} opt_alpha
 * @return {string}
 */
dotprod.Palette.friendColor = function(opt_alpha) {
  if (opt_alpha === undefined) {
    opt_alpha = 1;
  }
  return 'rgba(255, 206, 99, ' + opt_alpha + ')';
};

/**
 * @param {number=} opt_alpha
 * @return {string}
 */
dotprod.Palette.notificationsColor = function(opt_alpha) {
  if (opt_alpha === undefined) {
    opt_alpha = 1;
  }
  return 'rgba(115, 255, 99, ' + opt_alpha + ')';
};
