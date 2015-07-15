var when = require('when');
var whenNode = require('when/node');
var es6gen = require('when/generator');
var _ = require('lodash');

var Graph = require('./graph');

var Token = (function(){

  // Public functions

  const PUBLIC_TOKEN_SET_KEY = '#PUBLIC_TOKEN_SET#';

  var is_public = es6gen.lift(function* (token, action) {
    return yield Graph.pathExists(PUBLIC_TOKEN_SET_KEY, token, action);
  })

  var add_public = es6gen.lift(function* (token, action) {
    return yield Graph.createLink(PUBLIC_TOKEN_SET_KEY, token, action);
  })

  var remove_public = es6gen.lift(function* (token, action) {
    return yield Graph.destroyLink(PUBLIC_TOKEN_SET_KEY, token, action);
  })

  var can_do = es6gen.lift(function* (U, V, action) {
    if (yield is_public(V)) {
      return true;
    }
    return yield Graph.pathExists(U, V);
  })

  return {
    is_public: is_public,
    add_public: add_public,
    remove_public: remove_public,
    can_do: can_do,
  }

})();

module.exports = Token;
