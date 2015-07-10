var Graph = require('../models/graph');
var db = require('../models/db');

var when = require('when');
var gen = require('when/generator');

var assert = require('assert');
/*
return {
  createToken: createTokenId,
  link: link,
  unlink: unlink,
  pathExists: pathExistsBetween,
}
*/

describe('Graph', function() {

  beforeEach(function () {
    return when(db.flushdb())
  })

  after(function () {
    return when(db.flushdb())
  })

  describe('#createToken()', function() {

    it('should not return null or undefined', gen.lift(function* () {
      var token = yield Graph.createToken();
      assert(token);
    }));

    it('should start with `token:`', gen.lift(function* () {
      var token = yield Graph.createToken();
    }));

  })

  describe('#createLink()', function () {

    it('links together two previously unrelated nodes', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();

      // Should not throw an error
      assert.ok(yield Graph.createLink(t1, t2));
    }))

    it('disallows creating simple cycles', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();

      assert.ok(yield Graph.createLink(t1, t2));

      try {
        yield Graph.createLink(t2, t1)
      }
      catch (err) {
        assert(true);
      }
    }))

    it('disallows creating triangular-cycles', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();
      var t3 = yield Graph.createToken();

      yield Graph.createLink(t1, t2);
      yield Graph.createLink(t2, t3);

      return Graph.createLink(t3, t1)
        .then(function () {
          return when.reject("was not rejected");
        })
        .catch(function () {
          return when(true);
        })
    }))

    it('allows creating triple-hop chains', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();
      var t3 = yield Graph.createToken();
      var t4 = yield Graph.createToken();

      yield Graph.createLink(t1, t2);
      yield Graph.createLink(t2, t3);
      yield Graph.createLink(t3, t4);
    }))

    it('allows creating multiple children', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();
      var t3 = yield Graph.createToken();
      var t4 = yield Graph.createToken();

      yield Graph.createLink(t1, t2);
      yield Graph.createLink(t1, t3);
      yield Graph.createLink(t1, t4);
    }))

  })

  describe('#pathExists()', function () {

    it('is able to find a single hop path', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();

      yield Graph.createLink(t1, t2);

      assert(yield Graph.pathExists(t1, t2));
      assert(! (yield Graph.pathExists(t2, t1)));
    }))

    it('is able to correctly interpret the wildcard action', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();

      yield Graph.createLink(t1, t2);

      assert(yield Graph.pathExists(t1, t2, 'not-formally-included'));
    }))

    it('does not confound actions and find false paths', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();

      yield Graph.createLink(t1, t2, 'read');
      yield Graph.createLink(t1, t2, 'write');

      assert(yield Graph.pathExists(t1, t2, 'read'));
      assert(yield Graph.pathExists(t1, t2, 'write'));
      assert(! (yield Graph.pathExists(t1, t2, 'bogus')));
      assert(! (yield Graph.pathExists(t1, t2, undefined)));
    }))

    it('does not return false prematurely when blocked by a mismatched action', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();
      var t3 = yield Graph.createToken();
      var t4 = yield Graph.createToken();

      yield Graph.createLink(t1, t2, 'a');
      yield Graph.createLink(t2, t4, 'a');
      yield Graph.createLink(t1, t3, 'b');
      yield Graph.createLink(t3, t4, 'b');

      assert(yield Graph.pathExists(t1, t4, 'a'));
      assert(yield Graph.pathExists(t1, t4, 'b'));
    }))

    it('handles a wildcard bridge correctly', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();
      var t3 = yield Graph.createToken();
      var t4 = yield Graph.createToken();

      yield Graph.createLink(t1, t2, 'read');
      yield Graph.createLink(t2, t3, undefined);
      yield Graph.createLink(t3, t4, 'read');

      assert(yield Graph.pathExists(t1, t4, 'read'));
      assert(! (yield Graph.pathExists(t1, t4, undefined)));
    }))

  })

  describe('#destroyLink()', function() {

    it('is able to destroy a simple link', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();

      yield Graph.createLink(t1, t2);
      assert(yield Graph.pathExists(t1, t2));

      yield Graph.destroyLink(t1, t2);
      assert(! (yield Graph.pathExists(t1, t2)));
    }))

    it('allows multiple completion paths after deletion', gen.lift(function* () {
      var t1 = yield Graph.createToken();
      var t2 = yield Graph.createToken();
      var t3 = yield Graph.createToken();
      var t4 = yield Graph.createToken();

      yield Graph.createLink(t1, t2);
      yield Graph.createLink(t2, t4);
      yield Graph.createLink(t1, t3);
      yield Graph.createLink(t3, t4);

      assert(yield Graph.pathExists(t1, t4));
      yield Graph.destroyLink(t1, t2);

      assert(yield Graph.pathExists(t1, t4));
      yield Graph.destroyLink(t1, t3);
    }))

  })


});
