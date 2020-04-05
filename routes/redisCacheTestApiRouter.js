let router = require('express').Router();
let request = require('request');

let redisClient = require('../services/redisClient').getClient();

let sendResponse = (name, createdAt)=>{
    return`${name} was created at ${createdAt}`;
}

let redisCacheRes = async (req, res, next)=>{
    let {username} = req.params;

    redisClient.get(username, (err, data)=>{
        if(err) return res.status(200).json({messgae: 'internal server error'});
        if(data){
            return res.send(sendResponse(username, data));
        } else{
            next();
        }
    });
}

let makeGitApiCall = async (req, res)=>{
    let {username} = req.params;
    let options = {
        headers: {'User-Agent': 'testApp'},
        url: `https://api.github.com/users/${username}`
    }
    console.log('calling git api');
    request.get(options, (err, user)=>{
        if(err) return res.status(500).json({message: 'internal server error'});
        let userJson = JSON.parse(user.body);
        let {login, created_at: createdAt} = userJson;
        redisClient.set(login, createdAt, (err, reply)=>{
            if(err) return res.status(200).json({messgae: 'internal server error'});
            if(reply) res.send(sendResponse(login, createdAt));
        });        
    });

}

router.get('/:username', redisCacheRes, makeGitApiCall)

module.exports = router;