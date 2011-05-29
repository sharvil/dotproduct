var isOffline = window.location.protocol == 'file:';

(function() {
  if (isOffline) {
    document.write('<script type="text/javascript" src="js/bootstrap/deps.js"></script>');
  } else {
    var hashObj = dotprod.QueryString.toObject(window.location.hash.substr(1));
    var queryObj = dotprod.QueryString.toObject(window.location.search.substr(1));
    var baseUrl = window.location.protocol + '//' + window.location.host + window.location.port + window.location.pathname;

    if (!hashObj['openid.mode']) {
      if (!queryObj['openid.mode']) {
        window.location.href = './login.html';
/*
        request['openid.mode'] = 'checkid_immediate';
        window.location.href = 'https://www.google.com/accounts/o8/ud?' + dotprod.QueryString.fromObject(request);
*/
        return;
      } else if (queryObj['openid.mode'] == 'setup_needed') {
        window.location.href = './login.html';
        return;
      } else if (queryObj['openid.mode'] == 'id_res') {
        window.location.href = baseUrl + '#' + dotprod.QueryString.fromObject(queryObj);
        return;
      } else if (queryObj['openid.mode'] == 'cancel') {
        window.location.href = './login.html#cancel';
        return;
      }
    }

    document.write('<script type="text/javascript" src="../deps.py?app=dotproduct"></script>');

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
