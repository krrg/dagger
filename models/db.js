var redis = require('then-redis');
var settings = require('../settings');

var db = redis.createClient({
  host: settings.REDIS_HOST,
  port: settings.REDIS_PORT
});

module.exports = db;
