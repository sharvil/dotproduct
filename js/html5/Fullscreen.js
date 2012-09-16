/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('html5.Fullscreen');

if (window.webkitRequestAnimationFrame) {
  html5.Fullscreen.isFullscreen = function() { return document.webkitIsFullScreen; };
  html5.Fullscreen.cancel = function() { document.webkitCancelFullScreen(); };
  html5.Fullscreen.request = function(arg) { document.body.webkitRequestFullScreen(arg); };
} else if (window.mozRequstAnimationFrame) {
  html5.Fullscreen.isFullscreen = function() { return document.mozFullScreen; };
  html5.Fullscreen.cancel = function() { document.mozCancelFullScreen(); };
  html5.Fullscreen.request = function(arg) { document.body.mozRequestFullScreen(arg); };
} else {
  html5.Fullscreen.isFullscreen = goog.nullFunction;
  html5.Fullscreen.cancel = goog.nullFunction;
  html5.Fullscreen.request = goog.nullFunction;
}
