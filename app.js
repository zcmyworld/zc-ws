var http = require('http');

var user = {};
var userCallback = {};
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
	req.connection.on('close', function() {
		console.log('connection close')
	})

	// socket.on('close', function() {
	// 	console.log('socket close')
	// })

	//建立连接
	var key = req.headers['sec-websocket-key'];
	var shasum = crypto.createHash('sha1');
	shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
	key = shasum.digest('base64');
	var headers = [
		'HTTP/1.1 101 Switching Protocols'
		, 'Upgrade: websocket'
		, 'Connection: Upgrade'
		, 'Sec-WebSocket-Accept: ' + key
	];
	socket.write(headers.concat('', '').join('\r\n'));

	// cookieStr = req.headers.cookie;
	// var cookieArr = cookieStr.split(';')
	// var cookieJson = {}
	// for (var i in cookieArr) {
	// 	cookieArr[i] = cookieArr[i].split('=')
	// 	cookieJson[cookieArr[i][0]] = cookieArr[i][1]
	// }
	// query(cookieJson.user, function() {
	// 	var data = "中文";
	// 	data = new Buffer(data);
	// 	var dataLength = data.length;
	// 	var dataOffset = 2; //第一字节存FIN,RSV1-3和opcode 第二字节存mask和数据长度
	// 	var payloadLen = dataLength; //Payload len
	// 	var totalLength = dataLength + dataOffset; //完整长度是数据长度+前两字节
	// 	var outputBuffer = new Buffer(totalLength);
	// 	outputBuffer[0] = 0x81; //代表FIN,RSV1-3和opcode
	// 	outputBuffer[1] = payloadLen; //代表mask和数据长度
	// 	data.copy(outputBuffer, dataOffset); //用data从outputBuffer的第2位开始覆盖其数据
	// 	socket.write(outputBuffer, 'binary'); //将数据以二进制格式传到客户端
	// })

	// setTimeout(function() {
	// 	//发送消息给user1
	// 	console.log('执行callback')
	// 	// userCallback['user1']();
	// }, 5000);
	//推送消息
	// var data = "中文";
	var data = "";
	for (var i = 0; i < 85535; i++) {
		data += 1;
	};
	data = new Buffer(data);
	var dataLength = data.length;
	var dataOffset = 2; //第一字节存FIN,RSV1-3和opcode 第二字节存mask和数据长度
	var payloadLen = dataLength;

	if (dataLength >= 65536) {
		dataOffset += 8;
		payloadLen = 127;
	} else if (dataLength > 125) {
		dataOffset += 2; //2字节Extended payload length
		payloadLen = 126;
	}
	var totalLength = dataLength + dataOffset;
	if (dataLength >= 65536) {
		totalLength = dataOffset
	}
	var outputBuffer = new Buffer(totalLength);
	outputBuffer[0] = 0x80 | 0x1;
	outputBuffer[1] = payloadLen; //代表mask和数据长度

	if (payloadLen == 126) {
		outputBuffer[2] = (dataLength & 0xff00) >> 8
		outputBuffer[3] = dataLength & 0xff
	}
	if (payloadLen == 127) {
		outputBuffer[2] = (dataLength & 0xff00000000000000) >> 512
		outputBuffer[3] = (dataLength & 0xff000000000000) >> 256
		outputBuffer[4] = (dataLength & 0xff0000000000) >> 128
		outputBuffer[5] = (dataLength & 0xff00000000) >> 64
		outputBuffer[6] = (dataLength & 0xff000000) >> 32
		outputBuffer[7] = (dataLength & 0xff0000) >> 16
		outputBuffer[8] = (dataLength & 0xff00) >> 8
		outputBuffer[9] = dataLength & 0xff
	}

	if (dataLength >= 65536) {
		socket.write(outputBuffer, 'binary');
		socket.write(data, 'binary')
	} else {
		data.copy(outputBuffer, dataOffset); //用data从outputBuffer的第2位开始覆盖其数据
		socket.write(outputBuffer, 'binary'); //将数据以二进制格式传到客户端	
	}
	// socketList[socket] = 1;
	//接收消息
	socket.on('data', function(data) {
		if (data[0].toString(2).slice(4) == 1000) {
			console.log('连接断开');
			return;
		}
		var mask_key = data.slice(2, 6) //获取mask-key
		var Payload_data = data.slice(6) //获取payload data
		for (var i = 0; i < Payload_data.length; i++) {
			Payload_data[i] = Payload_data[i] ^ mask_key[i % 4];
		} //^异或运算符
		// console.log(Payload_data.toString())
	})

	// setInterval(function() {
	// 	console.log('pong')
	// 	var data = "pong";
	// 	data = new Buffer(data);
	// 	var dataLength = data.length;
	// 	var dataOffset = 2; //第一字节存FIN,RSV1-3和opcode 第二字节存mask和数据长度
	// 	var payloadLen = dataLength; //Payload len
	// 	var totalLength = dataLength + dataOffset; //完整长度是数据长度+前两字节
	// 	var outputBuffer = new Buffer(totalLength);
	// 	// outputBuffer[0] = 0x81; //代表FIN,RSV1-3和opcode
	// 	outputBuffer[0] = 0x80 | 0x1;
	// 	outputBuffer[1] = payloadLen; //代表mask和数据长度
	// 	data.copy(outputBuffer, dataOffset); //用data从outputBuffer的第2位开始覆盖其数据
	// 	socket.write(outputBuffer, 'binary'); //将数据以二进制格式传到客户端
	// }, 3000)
});

server.listen(4180);
// server.timeout = 5000


function query(userName, callback) {
	userCallback[userName] = callback;
}

