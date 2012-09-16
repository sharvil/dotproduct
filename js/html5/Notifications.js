/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('html5.Notifications');

if (window.notifications) {
  html5.Notifications.checkPermission = window.notifications.checkPermission.bind(window.notifications);
  html5.Notifications.requestPermission = window.notifications.requestPermission.bind(window.notifications);
  html5.Notifications.createNotification = window.notifications.createNotification.bind(window.notifications);
} else if (window.webkitNotifications) {
  html5.Notifications.checkPermission = window.webkitNotifications.checkPermission.bind(window.webkitNotifications);
  html5.Notifications.requestPermission = window.webkitNotifications.requestPermission.bind(window.webkitNotifications);
  html5.Notifications.createNotification = window.webkitNotifications.createNotification.bind(window.webkitNotifications);
} else if (window.mozNotifications) {
  html5.Notifications.checkPermission = window.mozNotifications.checkPermission.bind(window.mozNotifications);
  html5.Notifications.requestPermission = window.mozNotifications.requestPermission.bind(window.mozNotifications);
  html5.Notifications.createNotification = window.mozNotifications.createNotification.bind(window.mozNotifications);
} else if (window.msNotifications) {
  html5.Notifications.checkPermission = window.msNotifications.checkPermission.bind(window.msNotifications);
  html5.Notifications.requestPermission = window.msNotifications.requestPermission.bind(window.msNotifications);
  html5.Notifications.createNotification = window.msNotifications.createNotification.bind(window.msNotifications);
}
