
var WebSocketServer = require('./websocket/WebSocketServer');
var websocketServer = new WebSocketServer({
	port: 4180
		// timeout:4000
})

websocketServer.urlHandler('/', function(req, res) {
	var header = {
		'Content-Type': 'text/html;charset=utf8'
	}
	res.writeHead(header)
	sendfile('views/index.html', function(file) {
		res.write(file)
		res.end();
		return;
	})
})
websocketServer.urlHandler('/canvas', function(req, res) {
	var header = {
		'Content-Type': 'text/html;charset=utf8'
	}
	res.writeHead(header)
	sendfile('views/canvas.html', function(file) {
		res.write(file)
		res.end();
	})
})
websocketServer.on('connection', function(ws) {
	var data = ''
	for (var i = 0; i < 75536; i++) {
		data += 1;
	}
	// var data = ''
	ws.send(data)

	ws.on('message', function(data) {
		console.log(data)
	})
})
websocketServer.on('close', function() {
	console.log('连接断开')
})

var fs = require('fs');

function sendfile(filename, callback) {
	var path = __dirname + "/" + filename
	var opt = {
		encoding: 'utf8'
	}
	fs.readFile(path, opt, function(err, file) {
		if (err) {
			console.log(err)
		}
		callback(file.toString())
	})
}