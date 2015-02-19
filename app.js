var querystring = require('querystring')
var utils = require('./utils');
//在线人数
var online_user = {}
//开局
var open_chess = {
	'hellovshello2': {
		black: 'hello',
		white: 'hello2',
		first: 'hello',
		chess: []
	}
}
//消息任务
var message_group = {}
//连接ws
var ws_group = {};

var WebSocketServer = require('./websocket/WebSocketServer');
var ws = new WebSocketServer({
	port: 4180
		// timeout:4000
})

ws.urlHandler('/login', function(req, res) {
	var cookie = utils.cookieParser(req.headers.cookie);
	if(cookie.userName&&online_user[cookie.userName]){
		ws.sendfile('/views/5chess.html', res);		
		return
	}
	ws.sendfile('/views/login.html', res);
})
ws.urlHandler('/5chess', function(req, res) {
	var cookie = utils.cookieParser(req.headers.cookie);
	var userName = cookie.userName;
	if (!checkLogin(userName)) {
		ws.sendfile('/views/login.html', res)
		return
	}
	ws.sendfile('/views/5chess.html', res);
})
ws.urlHandler('/login1', function(req, res) {
	var params;
	req.on('data', function(data) {
		var data = data.toString();
		params = querystring.parse(data);
	})
	req.on('end', function() {
		var userName = params['userName'];
		var json = {
			userName: userName
		}
		online_user[userName] = {
			userName: userName,
			chess_status: 0
		}
		res.setHeader("Set-Cookie", ['userName=' + userName]);
		res.send({
			error: 0,
			userName: userName
		})
	})
})

function checkLogin(userName) {
	if (online_user[userName]) {
		return true;
	}
	return false;
}

var setWS = function(userName, ws) {
	ws_group[userName] = ws
}
var queryWS = function(userName) {
	return ws_group[userName]
}

message_group.login = function(data, ws) {
	var userName = data.userName;

	setWS(userName, ws)
	for (var i in online_user) {
		var ws = queryWS(online_user[i].userName);
		var data = {
			flag: 'userList',
			userList: online_user
		}
		ws.send(JSON.stringify(data))
	}
}


ws.on('connection', function(ws) {
	var data = {
		flag: 'userList',
		userList: online_user
	}
	ws.send(JSON.stringify(data))

	ws.on('message', function(data) {
		var data = JSON.parse(data)
		message_group[data.flag](data, ws)
	})
})
ws.on('close', function() {
	console.log('连接断开')
})