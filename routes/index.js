var express = require('express');
var router = express.Router();
var path = require('path');

var middleware = require('./middleware');

/* GET home page. */
router.get('/', function (req, res){
	
	res.sendFile('main.html', { root: path.join(__dirname, '../public') }, function (err) {
        if (err) {
            console.log(err);
        }
    });
	// res.sendFile('./public/main.html');
	// res.sendfile('./public/main.html');
});

module.exports = router;
