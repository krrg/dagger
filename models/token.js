var redis = require('then-redis');
var crypto = require('crypto');
var when = require('when');
var whenNode = require('when/node');
var es6gen = require('when/generator');
var _ = require('lodash');

var settings = require('../settings');

var db = redis.createClient({
  host: settings.REDIS_HOST,
  port: settings.REDIS_PORT
});

var Token = (function(){

  var createTokenId = es6gen.lift(function* () {
    return 'token:' + (yield __gen_rand_bytes__());
  })

  var createLinkId = es6gen.lift(function* () {
    return 'link:' + (yield __gen_rand_bytes__());
  })

  var __gen_rand_bytes__ = function () {
    return whenNode.call(crypto.randomBytes, 32)
      .then(function(bytes) {
        return bytes.toString('base64');
      })
  }

  var revoke = null;

  var link = es6gen.lift(function* (U, V, action) {
    if (yield pathExistsBetween(V, U, action)) {
      return when.reject(new Error("Cannot create a cyclic permission chain!"))
    }

    if (! (yield db.hexists(U, V))) {
      yield db.hset(U, V, (yield createLinkId()));
    }

    var link_id = yield db.hget(U, V);
    yield db.sadd(link_id, action);
  })

  var pathExistsBetween = es6gen.lift(function* (U, V, action) {
    // At this point we have to do a DFS through the graph.

    var child_hash = yield db.hgetall(U);
    return when(_.some(child_hash, es6gen.lift(function*(child_link_id, child_key) {

      // Check to see if the action is correct.
      if (! (yield db.sismember(child_link_id, action))) {
        return false;
      }

      // If the action is
      if (child_key === V) {
        return true;
      }

      // We are on the right action, but don't have a matching child.
      // Recurse.
      return yield pathExistsBetween(child_key, V, action);

    })));
  })

  return {
    create: createTokenId,
    revoke: revoke,
    link: link,
    pathExists: pathExistsBetween,
  }

})();

module.exports = Token;
