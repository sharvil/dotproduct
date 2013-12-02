goog.provide('html5.AnimationFrame');

html5.AnimationFrame.request =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame;

html5.AnimationFrame.cancel =
    window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    window.mozCancelAnimationFrame ||
    window.oCancelAnimationFrame ||
    window.msCancelAnimationFrame;

html5.AnimationFrame.request = html5.AnimationFrame.request.bind(window);
html5.AnimationFrame.cancel = html5.AnimationFrame.cancel.bind(window);
