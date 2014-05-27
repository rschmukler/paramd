var clone = require('clone');

var whitelistError = new Error('Attempted to use white list method when already using black listing methods'),
    blacklistError = new Error('Attempted to use black list method when already using white listing methods');

var Param = module.exports = function Param(opts) {
  var paramd = function(json) {
    var whiteList = paramd._whiteList,
        blackList = paramd._blackList,
        whitelisting = paramd._whitelisting,
        key, result;

    if(whitelisting) {
      result = {};
      for(key in whiteList) {
        checkWhitelist(key, whiteList[key]);
      }
    } else {
      result = clone(json);
      for(key in blackList) {
        checkBlacklist(key, blackList[key]);
      }
    }

    return result;

    function checkWhitelist(attr, rule) {
      if(rule.if && !rule.if(json)) return;
      if(rule.required && !json[attr]) {
        var e = new Error(attr + ' is missing');
        e.status = rule.status;
        throw e;
      }
      result[attr] = json[attr];
    }

    function checkBlacklist(attr, rule) {
      if(rule.if && !rule.if()) return;
      delete result[attr];
    }

    function errorForRule(attr, rule) {
      return new Error(attr + ' is missing');
    }
  };

  paramd._blackList = {};
  paramd._whiteList = {};

  for(var key in Param.prototype) {
    paramd[key] = Param.prototype[key];
  }

  return paramd;
};

Param.prototype.require = function(attrs, opts) {
  this._setWhitelisting();

  if(typeof attrs == 'string') attrs = [attrs];
  opts = opts || {};
  opts.required = true;

  var whiteList = this._whiteList;
  attrs.forEach(function(attr) {
    whiteList[attr] = opts;
  });
  
  return this;
};

Param.prototype.optional = Param.prototype.allow = function(attrs, opts) {
  this._setWhitelisting();

  if(typeof attrs == 'string') attrs = [attrs];
  opts = opts || {};

  var whiteList = this._whiteList;
  attrs.forEach(function(attr) {
    whiteList[attr] = opts;
  });

  return this;
};

Param.prototype.except = Param.prototype.filter = function(attrs, opts) {
  this._setBlacklisting();
  if(typeof attrs == 'string') attrs = [attrs];
  opts = opts || {};
  var blackList = this._blackList;
  attrs.forEach(function(attr) {
    blackList[attr] = opts;
  });
  return this;
};

Param.prototype._setBlacklisting = function() {
  if(this._whitelisting === true) throw blacklistError;
  this._whitelisting = false;
};

Param.prototype._setWhitelisting = function() {
  if(this._whitelisting === false) throw whitelistError;
  this._whitelisting = true;
};
