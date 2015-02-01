goog.provide('html5.Notifications');

if (window.Notification) {
  html5.Notifications.requestPermission = window.Notification.requestPermission.bind(window.Notification);
  html5.Notifications.createNotification = function(icon, title, body) {
    return new Notification(title, {icon: icon, body: body});
  };
}
