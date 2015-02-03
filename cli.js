var http = require('http')
var options = {
	hostname: '127.0.0.1',
	port: 4180,
	method:'GET',
	headers: {
		"Sec-WebSocket-Key": "9ytoObvofmhVipGBSOGHpw==",
		"Sec-WebSocket-Version": 13,
		"Upgrade": "websocket"
	}
};

var req = http.request(options, function(res) {
	console.log('nima')
	res.setEncoding('utf8');
	res.on('data', function(chunk) {
		console.log('BODY: ' + chunk);
	});
});
req.end();