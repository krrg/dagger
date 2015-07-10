var crypto = require('crypto');
var when = require('when');
var whenNode = require('when/node');
var es6gen = require('when/generator');
var _ = require('lodash');

var db = require('./db');


var Graph = (function(){

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

  var unlink = es6gen.lift(function*(U, V, action) {
    if (! (yield db.hexists(U, V))) {
      return;
    }

    var link_id = yield db.hget(U, V);
    yield db.srem(link_id, action);
    if (yield db.scard(link_id)) {
      yield db.hdel(U, V, action);
    }
  })

  var link = es6gen.lift(function* (U, V, action) {
    if (U === V) {
      return when.reject(new Error("Cannot create a cyclic permission chain to myself"))
    }

    if (yield pathExistsBetween(V, U, action)) {
      return when.reject(new Error("Cannot create a cyclic permission chain!"))
    }

    if (! (yield db.hexists(U, V))) {
      yield db.hset(U, V, (yield createLinkId()));
    }

    var link_id = yield db.hget(U, V);
    yield db.sadd(link_id, action);

    return true;  // It is desirable to return a truthy value in the promise.
  })

  var pathExistsBetween = es6gen.lift(function* (U, V, action) {

    var child_hash = yield db.hgetall(U);

    // TODO: This can still be optimized further.  However, the algorithm should be correct.
    var foundPath = false;

    for (var child_key in child_hash) {
      var child_link_id = child_hash[child_key];

      if (! (yield db.sismember(child_link_id, undefined)) &&
          ! (yield db.sismember(child_link_id, action))) {
        continue;
      }

      if (child_key === V) {
        foundPath = true;
        break;
      }

      if (yield pathExistsBetween(child_key, V, action)) {
        foundPath = true;
        break;
      }
    }

    return foundPath;
  })

  // TODO: Unify exported names with private names.
  return {
    createToken: createTokenId,
    createLink: link,
    destroyLink: unlink,
    pathExists: pathExistsBetween,
  }

})();

module.exports = Graph;
