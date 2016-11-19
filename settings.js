
var AppSettings = (function(){

  var REDIS_HOST = "127.0.0.1";
  var REDIS_PORT = 6379;

  return {
    REDIS_HOST: REDIS_HOST,
    REDIS_PORT: REDIS_PORT,
  }

})();

module.exports = AppSettings;
