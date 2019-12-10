var compression = require('compression');
var express = require('express');
var session = require('express-session');
// var favicon = require('serve-favicon');
// var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var busboy = require('connect-busboy');

var http = require('http');
var path = require('path');
var io = require('socket.io');

var app = express();
var server = http.createServer(app);
var ioServer = io.listen(server);

var setting = require('./app.setting.json');

// 相關 redis session
var redis = require('redis');
var redisClient  = redis.createClient();
redisClient.on('error', (err) => {
    console.log('Redis error: ', err);
});
var RedisStore = require('connect-redis')(session);
var redisStore = new RedisStore({
    host : setting.RedisStore.host,
    port : setting.RedisStore.port,
    client : redisClient,
    ttl : setting.RedisStore.ttl, //session有效期限-單位s
});
var sessionService = require('./until/session-service');
sessionService.initializeRedis(redisClient, redisStore);

// Socket route dependencies
var usersSocketRoute = require('./routes/users-socket');

const cors = require('cors');
var corsOptions = {
    origin: '*',
    // origin要指定特定IP，否則每次跨域的session都會不一樣
    // origin: ['http://127.0.0.1:3000', 'http://61.216.149.43:3000'],
    optionsSuccessStatus: 200,
}

var routes = require('./routes/index');
var auth = require('./routes/auth');
var restful = require('./routes/restful');
var toolbox = require('./routes/toolbox');
var cargoaircraft = require('./routes/cargoaircraft');
cargoaircraft.GetCargoAircraftTime();
var middleware = require('./routes/middleware');

/**
 * 印出行數
 * 範例: console.log(__line);
 */
Object.defineProperty(global, '__stack', {
    get: function(){
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function(_, stack){ return stack; };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});

Object.defineProperty(global, '__line', {
    get: function(){
        return __stack[1].getLineNumber();
    }
});

var authChecker = function(req, res, next) {
    // 由前端檢查session
    let _id = until.FindID(req.session);

    if(_id == null){
        // res.status(403).json({
        //     "returnData": '尚無權限'
        // });
        res.status(403).send('超時已登出');
    }else{
        next()
    }

}

var protected   = [authChecker],
    unprotected = [];

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(compression());
app.use(cors(corsOptions))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser(setting.RedisStore.secret));
app.use(busboy());
app.use(session({
    name: setting.RedisStore.name,
    store : redisStore,
    secret : setting.RedisStore.secret,
    // cookie : {
    //     maxAge : 5000 //session有效期限-單位ms
    // },
    saveUninitialized: false,
    resave: false
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/auth', auth);
app.use('/restful', restful);
app.get('/restful', protected);
app.use('/toolbox', toolbox);
app.get('/toolbox', protected);
app.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
});
app.get('*', function(req, res) { 

    // redisClient.keys("sess:*", function(error, keys){
    //     console.log("Number of active sessions: ", keys.length);
    // });

    // console.log(req.path);
    // console.log(404);
    res.sendFile('404.html', { root: path.join(__dirname, 'public') }, function (err) {
        if (err) {
            console.log(err);
        } else {
            // console.log('進入非法路徑'+req.path+', 給予404畫面');
        }
    });
    // res.sendfile('../public/404.html');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        // res.render('error', {
        //     message: err.message,
        //     error: err
        // });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    // res.render('error', {
    //     message: err.message,
    //     error: {}
    // });
});

// module.exports = app;

server.listen(setting.Socket.port);

ioServer.use(function(socket, next){

    var handshake = socket.request,
        parseCookie = cookieParser(setting.RedisStore.secret);
    
    parseCookie(handshake, null, async function (err, data) {

        try {
            var session = await sessionService.get(handshake);

            if (!session) {
                return new Error('Not authorized');
            }

            handshake.session = session;
            next();
        } catch (err) {
            return new Error(err.message);
        }
    }); 
    
});

ioServer.sockets.on('connection', function (socket) {
    // console.log(socket.request);
    usersSocketRoute(socket);
});

// server port 3000
// node --max-http-header-size=200000 app
app.listen(setting.NodeJs.port, function() {
    return console.info("Express server listening on port " + (this.address().port) + " in " + process.env.NODE_ENV + " mode");
}).on('error', function(err){
    console.log('server error handler');
    console.log(err);
});