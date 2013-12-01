/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('views.LoginView');

goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.events.EventType');
goog.require('net.Protocol');
goog.require('net.Protocol.S2CPacketType');
goog.require('views.View');

/**
 * @constructor
 * @extends {views.View}
 * @param {!Object} loginData
 * @param {!net.Protocol} protocol
 * @param {function(!Object.<string, !Object>, !Object, !Object.<number, number>)} successCb
 */
views.LoginView = function(loginData, protocol, successCb) {
  goog.base(this, /** @type {!HTMLDivElement} */ (goog.dom.getElement(views.LoginView.LOGIN_VIEW_ID_)));

  /**
   * @type {!HTMLInputElement}
   * @private
   */
  this.nameNode_ = /** @type {!HTMLInputElement} */ (goog.dom.createElement('input'));
  this.nameNode_.className = views.LoginView.CSS_NAME_INPUT_;
  this.nameNode_.value = loginData['openid.name'];

  /**
   * @type {!HTMLInputElement}
   * @private
   */
  this.buttonNode_ = /** @type {!HTMLInputElement} */ (goog.dom.createElement('input'));
  this.buttonNode_.type = 'submit';
  this.buttonNode_.className = views.LoginView.CSS_LOGIN_BUTTON_;
  this.buttonNode_.value = 'Register';

  /**
   * @type {!HTMLFormElement}
   * @private
   */
  this.formNode_ = /** @type {!HTMLFormElement} */ (goog.dom.createElement('form'));
  // Wrap the input fields inside an empty form so that the enter button fires the submit button.
  this.formNode_.onsubmit = function() { return false; };
  this.formNode_.appendChild(this.nameNode_);
  this.formNode_.appendChild(this.buttonNode_);
  this.formNode_.style.display = 'none';

  /**
   * @type {!net.Protocol}
   * @private
   */
  this.protocol_ = protocol;
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.LOGIN_REPLY, goog.bind(this.onLoginReply_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.QUERY_NAME_REPLY, goog.bind(this.onQueryNameReply_, this));
  this.protocol_.registerHandler(net.Protocol.S2CPacketType.REGISTER_NAME_REPLY, goog.bind(this.onRegisterNameReply_, this));
  this.protocol_.login(loginData);

  /**
   * @type {function(!Object.<string, !Object>, !Object, !Object.<number, number>)}
   * @private
   */
  this.successCb_ = successCb;

  goog.events.listen(this.nameNode_, goog.events.EventType.INPUT, goog.bind(this.onNameChanged_, this));
  goog.events.listen(this.buttonNode_, goog.events.EventType.CLICK, goog.bind(this.onLoginButtonPressed_, this));
};
goog.inherits(views.LoginView, views.View);

/**
 * @type {string}
 * @const
 * @private
 */
views.LoginView.LOGIN_VIEW_ID_ = 'lv';

/**
 * @type {string}
 * @const
 * @private
 */
views.LoginView.CSS_NAME_INPUT_ = 'lv-name';

/**
 * @type {string}
 * @const
 * @private
 */
views.LoginView.CSS_LOGIN_BUTTON_ = 'lv-login-button';

/**
 * @param {!HTMLDivElement} rootNode
 * @override
 */
views.LoginView.prototype.renderDom = function(rootNode) {
  goog.base(this, 'renderDom', rootNode);

  rootNode.appendChild(this.formNode_);
};

views.LoginView.prototype.onNameChanged_ = function() {
  this.protocol_.queryName(this.nameNode_.value);
};

views.LoginView.prototype.onLoginButtonPressed_ = function() {
  this.protocol_.registerName(this.nameNode_.value);
};

/**
 * @param {!Array} packet
 */
views.LoginView.prototype.onLoginReply_ = function(packet) {
  switch(packet[0]) {
    case 0: {
      alert('Login failure: ' + packet[1]);
      break;
    }
    case 1: {
      var resources = packet[1];
      var settings = packet[2];
      var mapData = packet[3];
      var mapProperties = packet[4];

      this.successCb_(resources, settings, mapData, mapProperties);
      break;
    }
    case 2: {
      this.formNode_.style.display = '';
      this.nameNode_.value = '';
      this.nameNode_.focus();
      break;
    }
  }
};

/**
 * @param {!Array} packet
 */
views.LoginView.prototype.onQueryNameReply_ = function(packet) {
  //console.log('query name reply: ' + packet[0] + ' = ' + packet[1]);
};

/**
 * @param {!Array} packet
 */
views.LoginView.prototype.onRegisterNameReply_ = function(packet) {
  //console.log('register name reply: ' + packet[0] + ' = ' + packet[1]);
};
