var EventEmitter = require('events').EventEmitter;
var util = require('util');
var http = require('http');
var crypto = require('crypto');
var Sender = require('./Sender');
var Receiver = require('./Receiver');

function WebSocketServer(options) {
	EventEmitter.call(this)
	var self = this;
	options.port = options.port || 3000;
	this.server = http.createServer(function(req, res) {
		var path = req.url;
		if (url_groups[path]) {
			url_groups[path](req, res)
		}
	});
	this.server.listen(options.port)
	console.log('server start')
	if (options.timeout) {
		this.server.timeout = options.timeout //defult:12000
	}
	var opts = {}
	opts.timeout = this.server.timeout || 12000
	this.server.on('upgrade', function(req, socket, body) {
		req.connection.on('close', function() {
			self.emit('close')
		})
		establishConnection(req, socket, body)
		var handler = new Handler(req, socket, body, opts);
		self.emit('connection', handler)
	});
};
util.inherits(WebSocketServer, EventEmitter);


var url_groups = {};

WebSocketServer.prototype.urlHandler = function(path, handler) {
	url_groups[path] = handler
}

function establishConnection(req, socket, body) {
	var key = req.headers['sec-websocket-key'];
	var shasum = crypto.createHash('sha1');
	shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
	key = shasum.digest('base64');
	var headers = [
		'HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade', 'Sec-WebSocket-Accept: ' + key
	];
	socket.write(headers.concat('', '').join('\r\n'));
}

function Handler(req, socket, body, opts) {
	EventEmitter.call(this)
	var self = this;
	self.sender = new Sender(socket);
	self.receiver = new Receiver(true);
	if (opts.timeout > 3000) { //debug
		setInterval(function() {
			self.sender.ping()
		}, opts.timeout - 1000)
	}
	self.receiver.ontext = function(data) {
		self.emit('message', data)
	}
	socket.on('data', function(data) {
		self.receiver.parse(data)
	})
}


util.inherits(Handler, EventEmitter);
Handler.prototype.send = function(data) {
	this.sender.send(data)
}


module.exports = WebSocketServer;



