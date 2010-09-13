/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.views.LoginView');

goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('dotprod.Protocol');
goog.require('dotprod.Protocol.S2CPacketType');
goog.require('dotprod.views.View');

/**
 * @constructor
 * @extends {dotprod.views.View}
 * @param {!dotprod.Protocol} protocol
 * @param {function(!Object.<string, !Object>, !Object, !Object.<number, number>)} successCb
 */
dotprod.views.LoginView = function(protocol, successCb) {
  /**
   * @type {!HTMLInputElement}
   * @private
   */
  this.nameNode_ = /** @type {!HTMLInputElement} */ (goog.dom.createElement('input'));
  this.nameNode_.className = dotprod.views.LoginView.CSS_NAME_INPUT_;

  /**
   * @type {!HTMLInputElement}
   * @private
   */
  this.buttonNode_ = /** @type {!HTMLInputElement} */ (goog.dom.createElement('input'));
  this.buttonNode_.type = 'submit';
  this.buttonNode_.className = dotprod.views.LoginView.CSS_LOGIN_BUTTON_;
  this.buttonNode_.value = 'Play!';

  /**
   * @type {!dotprod.Protocol}
   * @private
   */
  this.protocol_ = protocol;
  this.protocol_.registerHandler(dotprod.Protocol.S2CPacketType.LOGIN_REPLY, goog.bind(this.onLoginReply_, this));

  /**
   * @type {function(!Object.<string, !Object>, !Object, !Object.<number, number>)}
   * @private
   */
  this.successCb_ = successCb;

  goog.events.listen(this.buttonNode_, goog.events.EventType.CLICK, goog.bind(this.onLoginButtonPressed_, this));
};
goog.inherits(dotprod.views.LoginView, dotprod.views.View);

/**
 * @type {string}
 * @const
 * @private
 */
dotprod.views.LoginView.CSS_NAME_INPUT_ = 'lv-name';

/**
 * @type {string}
 * @const
 * @private
 */
dotprod.views.LoginView.CSS_LOGIN_BUTTON_ = 'lv-login-button';

/**
 * @param {!HTMLDivElement} rootNode
 * @override
 */
dotprod.views.LoginView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  // Wrap the input fields inside an empty form so that the enter button
  // fires the submit button.
  var formNode = goog.dom.createElement('form');
  formNode.onsubmit = function() { return false; };
  formNode.appendChild(this.nameNode_);
  formNode.appendChild(this.buttonNode_);

  rootNode.appendChild(formNode);

  this.nameNode_.focus();
};

dotprod.views.LoginView.prototype.onLoginButtonPressed_ = function() {
  this.protocol_.login(this.nameNode_.value);
};

/**
 * @param {!Array} packet
 */
dotprod.views.LoginView.prototype.onLoginReply_ = function(packet) {
  var success = !!packet[0];
  if (success) {
    var resources = packet[1];
    var settings = packet[2];
    var mapData = packet[3];

    // TODO(sharvil): shoving the user name into the settings is pretty evil...
    settings['name'] = this.nameNode_.value;
    this.successCb_(resources, settings, mapData);
  } else {
    alert('Login failure: ' + packet[1]);
    this.nameNode_.value = '';
    this.nameNode_.focus();
  }
};
