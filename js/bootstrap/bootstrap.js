var bootstrapSettings = {};

(function() {
  var splitHash = function() {
    var ret = {};
    var string = window.location.hash.substr(1);
    var pairs = string.split('&');
    if (window.location.protocol == 'file:') {
      ret['offline'] = true;
    }
    for (var i = 0; i < pairs.length; ++i) {
      var keyValues = pairs[i].split('=');
      if (keyValues.length == 1) {
        ret[keyValues[0]] = true;
      } else if (keyValues.length == 2) {
        ret[keyValues[0]] = keyValues[1];
      }
    }
    return ret;
  }

  var name = '../deps.py?app=dotproduct';
  bootstrapSettings = splitHash();

  if (bootstrapSettings['offline']) {
    name = 'js/bootstrap/deps.js';
    if (!bootstrapSettings['url']) {
      bootstrapSettings['url'] = 'ws://localhost:8000/dotproduct';
    }
  }

  if (!bootstrapSettings['url']) {
    bootstrapSettings['url'] = 'ws://dev.nanavati.net:8000/dotproduct';
  }

  document.write('<script type="text/javascript" src="' + name + '"></script>');
})();
