"use strict";
var redis = require("redis");
var bluebird = require("bluebird");
var redisAsync = bluebird.promisifyAll(redis);
var client = redisAsync.createClient();
