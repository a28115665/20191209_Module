module.exports = {
    SessionCheck: function(req, res, next) {
    	console.log(req.session.key === undefined);
    	if(req.session.key === undefined) {
			// res.status(500).location('/login');//.send('逾時登出');
			// res.redirect(302, '/#/login');

			res.status(500).sendFile('main.html', { root: path.join(__dirname, '../public') });
			// res.status(500).send('逾時登出');
    		// res.status(302).sendFile('./public/404.html');
    		// return;
    	}else{
			next();
    	}

		// if(req.session == null){
		// 	// 使用者尚未登入
		// 	res.sendfile('./public/main.html');
		// 	// res.redirect('/login');
		// 	console.log('失敗');
		// 	return;
		// }
		// console.log('成功');

	}
};