/**
 * @fileoverview Provides a timestamp printing function
 */

goog.provide('Timestamp');

Timestamp.print = function() {
  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var seconds = currentTime.getSeconds();
  
  var mPad = minutes < 10 ? '0' : '';
  var sPad = seconds < 10 ? '0' : '';
  var ampm = hours >= 12 ? 'PM' : 'AM';
  var standardHours = hours >= 13 ? hours - 12 :
                      hours == 0 ? 12 :
                      hours;

  return standardHours + ':' + mPad + minutes + ':' + sPad + seconds + ' ' + ampm;
};
