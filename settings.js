
var AppSettings = (function(){

  var REDIS_HOST = "192.168.59.103";
  var REDIS_PORT = 6379;

  return {
    REDIS_HOST: REDIS_HOST,
    REDIS_PORT: REDIS_PORT,
  }

})();

module.exports = AppSettings;
