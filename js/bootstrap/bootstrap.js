var isOffline = window.location.protocol == 'file:' || window.location.hash.indexOf('offline') != -1;

(function() {
  if (isOffline) {
    document.write('<script type="text/javascript" src="../deps.js"></script>');
  } else {
    var hashObj = dotprod.QueryString.toObject(window.location.hash.substr(1));

    if (!hashObj['accessToken']) {
      window.location.href = './login.html';
      return;
    }

    document.write('<script type="text/javascript" src="../deps.js"></script>');

    // Google Analytics
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', 'UA-3572706-2']);
    _gaq.push(['_trackPageview']);
    (function() {
      var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
      ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
      var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
  }
})();
