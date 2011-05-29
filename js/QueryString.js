/**
 * @fileoverview Description of this file.
 * @author sharvil.nanavati@gmail.com (Sharvil Nanavati)
 */

goog.provide('dotprod.QueryString');

/**
 * @param {string} queryString
 * @return {!Object}
 */
dotprod.QueryString.toObject = function(queryString) {
  var ret = {};
  var records = queryString.split('&');
  for (var i = 0; i < records.length; ++i) {
    var record = records[i];
    var kv = record.split('=');
    if (record.length == 0 || kv.length == 0) {
      continue;
    } else if (kv.length == 1) {
      ret[decodeURIComponent(kv[0])] = true;
    } else {
      ret[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1]);
    }
  }
  return ret;
};

/**
 * @param {!Object} obj
 * @return {string}
 */
dotprod.QueryString.fromObject = function(obj) {
  var ret = [];
  for (var key in obj) {
    var record = encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
    ret.push(record);
  }
  return ret.join('&');
};
