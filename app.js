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


var server = http.createServer(function(e) {});
var crypto = require('crypto');
server.on('upgrade', function(req, socket, body) {

	var isBig = false;
	var bigData = [];
	var totalLength = 0;
	var maskArr = []

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
		if (data[0].toString(2).slice(4) == 1000) {
			// console.log('连接断开');
			return;
		}
		// console.log(data.length)
		if (isBig) {
			var flagLength = 0;
			if (flagLength < totalLength) {
				bigData.push(data)
			}
			for (var i in bigData) {
				flagLength += bigData[i].length
			}
			if (flagLength == totalLength) {
				var Payload_data= Buffer.concat(bigData);
				var mask_key = maskArr[0]
				for (var i = 0; i < Payload_data.length; i++) {
					Payload_data[i] = Payload_data[i] ^ mask_key[i % 4];
				}
				console.log(Payload_data.length)
				bigData = []
				isBig = false;
			}
			return;
		}
		
		if (payloadLen < 126) {
			var mask_key = data.slice(2, 6) //获取mask-key
			var Payload_data = data.slice(6) //获取payload data
		}
		if (payloadLen == 126) {
			mask_key = data.slice(4, 8);
			Payload_data = data.slice(8)
		}
		if (payloadLen == 127) {
			totalLength = parseTotalLength(data);
			isBig = true;
			var mask_key = data.slice(10, 14)
			maskArr.push(mask_key)
			bigData.push(data.slice(14))
			return
		}

		for (var i = 0; i < Payload_data.length; i++) {
			Payload_data[i] = Payload_data[i] ^ mask_key[i % 4];
		} //^异或运算符
		// console.log(Payload_data.toString())
		console.log(Payload_data.length)
	})

	//推送消息
	// setTimeout(function() {
	var data = "abcdefg:" + new Date().getTime()
	var data = "";
	for (var i = 0; i < 75536; i++) {
		data += 1;
	};
	// var data = "hello"
	send(data, socket)
});

server.listen(4180);


function parseTotalLength(data) {
	var totalLength = 0 ;
	totalLength += parseInt(data[9].toString())
	totalLength += parseInt((data[8] << 8).toString())
	totalLength += parseInt((data[7] << 16).toString())
	totalLength += parseInt((data[6] << 32).toString())
	totalLength += parseInt((data[5] << 64).toString())
	totalLength += parseInt((data[4] << 128).toString())
	totalLength += parseInt((data[3] << 256).toString())
	totalLength += parseInt((data[2] << 512).toString())
	return totalLength;
}


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