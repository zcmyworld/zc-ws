var net = require('net'),
	websocket = require('websocket-driver');

var driver = websocket.client('ws://127.0.0.1/socket'),
	tcp = net.connect(4180, '127.0.0.1');//监听4180端口

tcp.pipe(driver.io).pipe(tcp);

tcp.on('connect', function() {
	driver.start();
});

driver.messages.on('data', function(message) {
	console.log('Got a message', message);//接收来自浏览器的消息
});

// function Person(name, age) {
// 	this.name = name;
// 	this.age = age;
// 	// console.log(name + "" + age)
// }
// function Student(name,age){
// 	console.log(Person.apply(this,['name','age']));
// 	console.log(this.name)
// 	console.log(this.age)
// }
// // Student()
// console.log(Person.apply(null, [1, 1]))