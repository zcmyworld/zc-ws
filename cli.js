var http = require('http')
var crypto = require('crypto')
var key = new Buffer(13 + '-' + Date.now()).toString('base64');
var shasum = crypto.createHash('sha1');
shasum.update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
var expectedServerKey = shasum.digest('base64');
var options = {
	hostname: '127.0.0.1',
	port: 4180,
	headers: {
		"Connection": "Upgrade",
		"Host": "127.0.0.1:4180",
		"Origin": "127.0.0.1:4180",
		"Sec-WebSocket-Key": key,
		"Sec-WebSocket-Version": 13,
		"Upgrade": "websocket"
	}
};
var req = http.request(options);
req.on('upgrade',function(res,socket,upgradeHead){
	var serverKey = res.headers['sec-websocket-accept']
	// console.log(upgradeHead.slice(2).toString())
	// socket.on('data', function(data) {
	// 	var data = data.slice(2)
	// 	console.log(data.toString())
	// })
	// var data = "helloworld"
	var data = "";
	for (var i = 0; i < 75536; i++) {
		data += 1;
	};
	// data = "hello"
	console.log(data.length)
	send(data,socket)
})
req.end();

function getRandomMask() {
  return new Buffer([
    ~~(Math.random() * 255),
    ~~(Math.random() * 255),
    ~~(Math.random() * 255),
    ~~(Math.random() * 255)
  ]);
}
function doMask(source, mask, output, offset, length) {
    var maskNum = mask.readUInt32LE(0, true);
    var i = 0;

    for (; i < length - 3; i += 4) {
      var num = maskNum ^ source.readUInt32LE(i, true);
      if (num < 0) num = 4294967296 + num;
      output.writeUInt32LE(num, offset + i, true);
    }

    switch (length % 4) {
      case 3: output[offset + i + 2] = source[i + 2] ^ mask[2];
      case 2: output[offset + i + 1] = source[i + 1] ^ mask[1];
      case 1: output[offset + i] = source[i] ^ mask[0];
    }
}

function send(data,socket){
	data = new Buffer(data);
	var dataLength = data.length;
	var dataOffset = 6; //第一字节存FIN,RSV1-3和opcode 第二字节存mask和数据长度
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

	var mask = getRandomMask();
	outputBuffer[dataOffset - 4] = mask[0];
    outputBuffer[dataOffset - 3] = mask[1];
    outputBuffer[dataOffset - 2] = mask[2];
    outputBuffer[dataOffset - 1] = mask[3];

    if(dataLength >=65536){
      doMask(data, mask, data, 0, dataLength);
      	console.log(outputBuffer.length)
        socket.write(outputBuffer, 'binary');
        socket.write(data, 'binary');
    }else{
    	doMask(data, mask, outputBuffer, dataOffset, dataLength);
		socket.write(outputBuffer, 'binary');	
    }

}