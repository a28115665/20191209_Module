var setting = require('../app.setting.json');

var redisClient = null;
var redisStore = null;

var self = module.exports = {
    initializeRedis: function (client, store) {
        redisClient = client;
        redisStore = store;
    },
    getSessionId: function (handshake) {
        return handshake.signedCookies[setting.RedisStore.name];
    },
    get: function (handshake) {
        return new Promise(async (resolve, reject) => {
            var sessionId = self.getSessionId(handshake);

            try {
                var session = await self.getSessionBySessionID(sessionId);
                resolve(session);
            } catch(err) {
                reject(err);
            }
        })   
    },
    getSessionBySessionID: function (sessionId) {
        return new Promise((resolve, reject) => {
            redisStore.load(sessionId, function (err, session) {
                if (err) reject(err);
                else
                    resolve(session);
            });
        })   
    },
    getUserID: function (handshake) {
        return new Promise(async (resolve, reject) => {
            try {
                var session = await self.get(handshake);
                resolve(session.key.U_ID);
            } catch (err) {
                reject(err);
            }
        })   
    },
    updateSession: function (session, callback) {
        try {
            session.reload(function () {
                session.touch().save();
                callback(null, session);
            });
        }
        catch (err) {
            callback(err);
        }
    },
    setSessionProperty: function (session, propertyName, propertyValue, callback) {
        session[propertyName] = propertyValue;
        self.updateSession(session, callback);
    },
    // 取得在縣人數
    getAllUsers: function (){
        return new Promise((resolve, reject) => {
            redisClient.keys("sess:*", function(err, keys){
                if (err) reject(err);
                if (keys)
                    resolve(keys);
                else
                    reject(null);
            })
        })
    }
};