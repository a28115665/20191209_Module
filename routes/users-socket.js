var moment = require('moment');

var sessionService = require('../until/session-service');
var userIsConnected = true;

module.exports = function (socket) {

    socket.on('userLogin', async function (data, callback) {

 		try {

	    	var allUsers = await sessionService.getAllUsers();
			console.log('在線人數:', allUsers.length);

        	// 推播至所有人，了解誰已上線
			var session = await sessionService.get(socket.request);

        	userIsConnected = true;
        	console.log('登入成功('+moment().format('YYYY-MM-DD HH:mm:ss')+'):', session.key.U_ID);
        	socket.broadcast.emit('whoLogin', session.key.U_NAME+' 已登入');

        	// 推播至帳號管理頁面，了解目前上線人員
        	var allUsers = await sessionService.getAllUsers();

	    	var currentUserIDs = [];
	    	for(var i=0 ; i < allUsers.length ; i++){
	    		var session = await sessionService.getSessionBySessionID(allUsers[i].replace('sess:', ''));
	    		currentUserIDs.push(session.key.U_ID)
	    	}
        	socket.broadcast.emit('getAllUsers', currentUserIDs)

    		callback(null, session.key.U_ID);

	    } catch (err) {
        	callback(err);
	    }

    });

    socket.on('getAllUsers', async function(data, callback){

 		try {

	    	var allUsers = await sessionService.getAllUsers();

	    	var currentUserIDs = [];
	    	for(var i=0 ; i < allUsers.length ; i++){
	    		var session = await sessionService.getSessionBySessionID(allUsers[i].replace('sess:', ''));
	    		currentUserIDs.push(session.key.U_ID)
	    	}
	    	callback(null, currentUserIDs);

	    } catch (err) {
	        console.log(err)
	    }

    })

	socket.on("disconnect", async function () {

 		try {

	    	var currentUserID = await sessionService.getUserID(socket.request);

        	userIsConnected = false;
	        setTimeout(async function () {
	            if (!userIsConnected) {
	            	console.log('離線成功('+moment().format('YYYY-MM-DD HH:mm:ss')+'):', currentUserID);

					try {
	    				var allUsers = await sessionService.getAllUsers();
						console.log('在線人數:', allUsers.length);

			        	// 推播至帳號管理頁面，了解目前上線人員
			        	var allUsers = await sessionService.getAllUsers();

				    	var currentUserIDs = [];
				    	for(var i=0 ; i < allUsers.length ; i++){
				    		var session = await sessionService.getSessionBySessionID(allUsers[i].replace('sess:', ''));
				    		currentUserIDs.push(session.key.U_ID)
				    	}
			        	socket.broadcast.emit('getAllUsers', currentUserIDs)
				    } catch (err) {
		            	callback(err);
				    }

	            };
	        }, 3000);
	    } catch (err) {
        	console.log(err);
	    }

    });
}