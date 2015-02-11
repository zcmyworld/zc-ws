exports.buf = new Buffer(1)
setTimeout(function() {
	console.log(exports.buf)//--><Buffer 80>
}, 2000);


// var buf = new Buffer(1)
// console.log(buf)//--><Buffer 04>
// exchangeBuf(buf)
// console.log(buf)//--><Buffer 80>

// function exchangeBuf(buf){
// 	buf[0] = 0x80;
// }