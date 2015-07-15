var Token = require('../models/token')
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

describe('Token', function() {

  beforeEach(function () {
    return when(db.flushdb())
  })

  after(function () {
    return when(db.flushdb())
  })

  describe('public functions', function () {

    it("does not mark things public that are not", gen.lift(function* () {
      assert(! (yield Token.is_public("this is a fake token")));
      assert(! (yield Token.is_public(undefined)));
      assert(! (yield Token.is_public(null)));
    }))

    it("is able to mark tokens public", gen.lift(function* () {
      const TOKEN = "a public token";

      yield Token.add_public(TOKEN);

      assert(Token.is_public(TOKEN));
    }))

    it("is able to remove tokens as public", gen.lift(function* () {
      const TOKEN = "a public token";

      yield Token.add_public(TOKEN);
      yield Token.remove_public(TOKEN);

      assert(! (yield Token.is_public(TOKEN)));
    }))

  })

});
