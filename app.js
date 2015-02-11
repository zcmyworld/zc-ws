var http = require('http');
var myServer = http.createServer(function(request, response) {
	var path = request.url;
	if (path == '/') {
		var header = {
			'Content-Type': 'text/html;charset=utf8'
		}
		response.writeHead(header)
		sendfile('views/index.html', function(file) {
			response.write(file)
			response.end();
			return;
		})
	}

}).listen(3000);
console.log('server start')

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
var isBig = false;
var bigData = [];
var totalLength = 0;
var nimakey = []

var server = http.createServer(function(e) {});
var crypto = require('crypto');
server.on('upgrade', function(req, socket, body) {
	//建立连接
	var key = req.headers['sec-websocket-key'];
	var shasum = crypto.createHash('sha1');
	shasum.update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11");
	key = shasum.digest('base64');
	var headers = [
		'HTTP/1.1 101 Switching Protocols', 'Upgrade: websocket', 'Connection: Upgrade', 'Sec-WebSocket-Accept: ' + key
	];
	socket.write(headers.concat('', '').join('\r\n'));


	socket.on('data', function(data) {
		var payloadLen = data[1] & 0x7f;
		if (isBig) {
			bigData.push(data)
			if(bigData.length == 2){
				var hello = Buffer.concat([bigData[0],bigData[1]],totalLength);
				console.log(hello.length)
				Payload_data = hello;
				var mask_key = nimakey[0]
				for (var i = 0; i < Payload_data.length; i++) {
					Payload_data[i] = Payload_data[i] ^ mask_key[i % 4];
				}
				// console.log(Payload_data.toString())
			}
			return;
		}
		// if (data[0].toString(2).slice(4) == 1000) {
		// 	console.log('连接断开');
		// 	return;
		// }
		if (payloadLen < 126) {
			var mask_key = data.slice(2, 6) //获取mask-key
			var Payload_data = data.slice(6) //获取payload data
		}
		if (payloadLen == 126) {
			mask_key = data.slice(4, 8);
			Payload_data = data.slice(8)
		}
		if (payloadLen == 127) {
			var extendPayloadLen = new Buffer(8)
			extendPayloadLen[0] = data[2]
			extendPayloadLen[1] = data[3]
			extendPayloadLen[2] = data[4]
			extendPayloadLen[3] = data[5]
			extendPayloadLen[4] = data[6]
			extendPayloadLen[5] = data[7]
			extendPayloadLen[6] = data[8]
			extendPayloadLen[7] = data[9]
			var totalLength = parseInt(extendPayloadLen[7].toString())
			totalLength += parseInt((extendPayloadLen[6] << 8).toString())
			totalLength += parseInt((extendPayloadLen[5] << 16).toString())
			totalLength += parseInt((extendPayloadLen[4] << 32).toString())
			totalLength += parseInt((extendPayloadLen[3] << 64).toString())
			totalLength += parseInt((extendPayloadLen[2] << 128).toString())
			totalLength += parseInt((extendPayloadLen[1] << 256).toString())
			totalLength += parseInt((extendPayloadLen[0] << 512).toString())
			isBig = true;
			var mask_key = data.slice(10, 14)
			nimakey.push(mask_key)
		}

		// console.log(data.length)
		// for (var i = 0; i < Payload_data.length; i++) {
		// 	Payload_data[i] = Payload_data[i] ^ mask_key[i % 4];
		// } //^异或运算符
		// console.log(Payload_data.toString())
		// console.log(Payload_data.length)
	})

	//推送消息

	// setTimeout(function() {
	var data = "abcdefg:" + new Date().getTime()
	var data = "";
	for (var i = 0; i < 75536; i++) {
		data += 1;
	};
	send(data, socket)
});

server.listen(4180);

function send(data, socket) {
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
}