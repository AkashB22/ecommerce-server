let redis = require('redis');

exports.getClient = function(){
    let redisClient = redis.createClient({host:'localhost', port:6379});
    return redisClient;
}