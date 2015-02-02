var http = require('http');

var user = {}
var userNum = 0;

var myServer = http.createServer(function(request, response) {
	var path = request.url;
	if (path == '/') {
		var header = {
			'Content-Type': 'text/html;charset=utf8'
		}
		response.writeHead(200, header)
		sendfile('views/index.html', function(file) {
			response.write(file)
			response.end();
			return;
		})
	}
	// if (path == '/login') {
	// 	userNum++;
	// 	var userName = "user" + userNum;
	// 	var header = {
	// 		'Content-Type': 'text/html;charset=utf8',
	// 		'Set-Cookie': ["user=user" + userNum]
	// 	}
	// 	user['userNum'] = 1
	// 	response.writeHead(200, header)
	// 	response.end();
	// 	return;
	// }
	request.connection.on('close', function() {
		console.log('连接断开')
	})
}).listen(3000);
console.log('server start')

var fs = require('fs');
var socketList = {};

function sendfile(filename, callback) {
	var path = "G:\\testProject\\zc-ws\\" + filename;
	var opt = {
		encoding: 'utf8'
	}
	fs.readFile(path, opt, function(err, file) {
		if (err) {}
		callback(file.toString())
	})
}
var http = require('http');
var server = http.createServer(function(e) {});
var crypto = require('crypto');
server.on('upgrade', function(req, socket, body) {
	// req.connection.on('close', function() {
	// 	console.log('connection close')
	// })
	// socket.on('close', function() {
	// 	console.log('socket close')
	// })

	//建立连接
	var key = req.headers['sec-websocket-key'];
	var shasum = crypto.createHash('sha1');
	shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
	key = shasum.digest('base64');
	var headers = [
		'HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade', 'Sec-WebSocket-Accept: ' + key
	];
	socket.write(headers.concat('', '').join('\r\n'));

	// console.log(req.headers.cookie)
	
	//推送消息
	var data = "中文";
	data = new Buffer(data);
	var dataLength = data.length;
	var dataOffset = 2; //第一字节存FIN,RSV1-3和opcode 第二字节存mask和数据长度
	var payloadLen = dataLength; //Payload len
	var totalLength = dataLength + dataOffset; //完整长度是数据长度+前两字节
	var outputBuffer = new Buffer(totalLength);
	outputBuffer[0] = 0x81; //代表FIN,RSV1-3和opcode
	outputBuffer[1] = payloadLen; //代表mask和数据长度
	data.copy(outputBuffer, dataOffset); //用data从outputBuffer的第2位开始覆盖其数据
	socket.write(outputBuffer, 'binary'); //将数据以二进制格式传到客户端
	// socketList[socket] = 1;
	//接收消息
	// socket.on('data', function(data) {
	// 	if (data[0].toString(2).slice(4) == 1000) {
	// 		console.log('连接断开');
	// 		return;
	// 	}
	// 	console.log(data[0].toString(2).slice(4))
	// 	var mask_key = data.slice(2, 6) //获取mask-key
	// 	var Payload_data = data.slice(6) //获取payload data
	// 	for (var i = 0; i < Payload_data.length; i++) {
	// 		Payload_data[i] = Payload_data[i] ^ mask_key[i % 4];
	// 	} //^异或运算符
	// 	console.log(Payload_data.toString())
	// })
	setInterval(function() {
		console.log('pong')
		var data = "";
		data = new Buffer(data);
		var dataLength = data.length;
		var dataOffset = 2; //第一字节存FIN,RSV1-3和opcode 第二字节存mask和数据长度
		var payloadLen = dataLength; //Payload len
		var totalLength = dataLength + dataOffset; //完整长度是数据长度+前两字节
		var outputBuffer = new Buffer(totalLength);
		// outputBuffer[0] = 0x81; //代表FIN,RSV1-3和opcode
		outputBuffer[0] = 0x80 | 0xA;
		outputBuffer[1] = payloadLen; //代表mask和数据长度
		data.copy(outputBuffer, dataOffset); //用data从outputBuffer的第2位开始覆盖其数据
		socket.write(outputBuffer, 'binary'); //将数据以二进制格式传到客户端
	}, 3000)
});
server.on('connection', function() {
	console.log('有链接')
})

server.listen(4180);
// server.timeout = 5000

setInterval(function() {
	console.log(user)
}, 5000)