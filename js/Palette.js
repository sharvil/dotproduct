goog.provide('Palette');

/**
 * @return {string}
 */
Palette.borderColor = function() {
  return '#222';
};

/**
 * @return {string}
 */
Palette.radarBgColor = function() {
  return 'rgba(0, 20, 0, 0.65)';
};

/**
 * @return {string}
 */
Palette.radarTileColor = function() {
  return 'rgba(255, 255, 255, 0.3)';
};

/**
 * @return {string}
 */
Palette.radarPrizeColor = function() {
  return 'rgba(0, 255, 0, 0.8)';
};

/**
 * @param {number=} opt_alpha
 * @return {string}
 */
Palette.foeColor = function(opt_alpha) {
  if (opt_alpha === undefined) {
    opt_alpha = 1;
  }
  return 'rgba(198, 198, 247, ' + opt_alpha + ')';
};

/**
 * @return {string}
 */
Palette.chatNameColor = function() {
  return 'rgba(155, 215, 254, 1)';
};

/**
 * @return {string}
 */
Palette.chatTextColor = function() {
  return 'rgba(190, 190, 190, 1)';
};

/**
 * @param {number=} opt_alpha
 * @return {string}
 */
Palette.friendColor = function(opt_alpha) {
  if (opt_alpha === undefined) {
    opt_alpha = 1;
  }
  return 'rgba(255, 206, 99, ' + opt_alpha + ')';
};

/**
 * @param {number=} opt_alpha
 * @return {string}
 */
Palette.notificationsColor = function(opt_alpha) {
  if (opt_alpha === undefined) {
    opt_alpha = 1;
  }
  return 'rgba(115, 255, 99, ' + opt_alpha + ')';
};

/**
 * @param {number=} opt_alpha
 * @return {string}
 */
Palette.personalNotificationsColor = function(opt_alpha) {
  return Palette.friendColor(opt_alpha);
};

/**
 * @param {number=} opt_alpha
 * @return {string}
 */
Palette.enterNotificationsColor = function(opt_alpha) {
  return Palette.foeColor(opt_alpha);
};

/**
 * @return {string}
 */
Palette.criticalEnergyWarningColor = function() {
  return 'rgb(200, 0, 0)';
};

/**
 * @return {string}
 */
Palette.lowEnergyWarningColor = function() {
  return Palette.friendColor();
};
