'use strict'

const crypto = require('crypto');
const when = require('when');
const whenNode = require('when/node');
const es6gen = require('when/generator');
const _ = require('lodash');

const db = require('./db');


const Graph = (function(){

  async function createToken() {
    return 'token:' + (await __gen_rand_bytes__());
  }

  async function __createLinkId__() {
    return 'link:' + (await __gen_rand_bytes__());
  }

  async function __gen_rand_bytes__() {
    return whenNode.call(crypto.randomBytes, 32)
      .then(function(bytes) {
        return bytes.toString('base64');
      })
  }

  async function destroyLink(U, V, action) {
    if (! (await db.hexists(U, V))) {
      return;
    }

    var link_id = await db.hget(U, V);
    await db.srem(link_id, action);
    if (await db.scard(link_id)) {
      await db.hdel(U, V, action);
    }
  }

  async function createLink(U, V, action) {
    if (U === V) {
      return when.reject(new Error("Cannot create a cyclic permission chain to myself"))
    }

    if (await pathExists(V, U, action)) {
      return when.reject(new Error("Cannot create a cyclic permission chain!"))
    }

    if (! (await db.hexists(U, V))) {
      await db.hset(U, V, (await __createLinkId__()));
    }

    const link_id = await db.hget(U, V);
    await db.sadd(link_id, action);

    return true;  // It is desirable to return a truthy value in the promise.
  }

  async function pathExists(U, V, action) {

    let child_hash = await db.hgetall(U);

    // TODO: This can still be optimized further.  However, the algorithm should be correct.
    let foundPath = false;

    for (const child_key in child_hash) {
      let child_link_id = child_hash[child_key];

      if (! _.any(await when.all([
        await db.sismember(child_link_id, undefined),
        await db.sismember(child_link_id, action)
      ]))) {
        continue;
      }

      if (child_key === V) {
        foundPath = true;
        break;
      }

      if (await pathExists(child_key, V, action)) {
        foundPath = true;
        break;
      }
    }

    return foundPath;
  }

  // TODO: Unify exported names with private names.
  return {
    createToken: createToken,
    createLink: createLink,
    destroyLink: destroyLink,
    pathExists: pathExists,
  }

})();

module.exports = Graph;
