import * as redis from "redis";
import * as bluebird from "bluebird";

const redisAsync: any = bluebird.promisifyAll(redis);
let client = redisAsync.createClient();
