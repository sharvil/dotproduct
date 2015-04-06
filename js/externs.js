/** @interface */
var AudioNode = function() {};
AudioNode.prototype.connect = function(destination) {};

/**
 * @constructor
 * @implements {AudioNode}
 */
var AudioBufferSourceNode = function() {};
AudioBufferSourceNode.prototype.buffer;
AudioBufferSourceNode.prototype.start = function() {};
AudioBufferSourceNode.prototype.connect = function(destination) {};

/** @constructor */
var AudioContext = function() {};
AudioContext.prototype.destination;

/** @return {AudioBufferSourceNode} */
AudioContext.prototype.createBufferSource = function() {};
AudioContext.prototype.decodeAudioData = function(audioData, successCallback, errorCallback) {};

/**
 * @param {string} queryString
 * @return {!Object}
 */
window.toObject = function(queryString) {};

/**
 * @param {string} str
 * @return {string}
 */
window.linkify = function(str) {};
