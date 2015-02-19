var message_group = {}
$(document).ready(function() {
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	draw_board()
	c.addEventListener("click", click_event_handle, false)
	function click_event_handle(e) {
		var x = e.pageX;
		var y = e.pageY;
		x -= c.offsetLeft;
		y -= c.offsetTop;
		var x_line = parseInt(Number(x / 30).toFixed())
		var y_line = parseInt(Number(y / 30).toFixed())
		console.log(x_line + ' ' + y_line)
		if (x_line > 15 || x_line < 1 || y_line > 15 || y_line < 1) {
			return
		}
		draw_chess(x_line, y_line)
	}

	function draw_chess(x_line, y_line) {
		ctx.fillStyle = 'white'
		ctx.beginPath();
		ctx.arc(x_line * 30, y_line * 30, 10, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	function draw_board() {
		for (var i = 1; i < 16; i++) {
			ctx.moveTo(i * 30, 30);
			ctx.lineTo(i * 30, 450);
		}
		for (var i = 1; i < 16; i++) {
			ctx.moveTo(30, i * 30);
			ctx.lineTo(450, i * 30);
		}
		ctx.stroke();

		//绘制地图上的5个点
		ctx.fillStyle = 'black'
		ctx.beginPath();
		ctx.arc(30 * 4, 30 * 4, 4, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = 'black'
		ctx.beginPath();
		ctx.arc(30 * 12, 30 * 4, 4, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = 'black'
		ctx.beginPath();
		ctx.arc(30 * 4, 30 * 12, 4, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = 'black'
		ctx.beginPath();
		ctx.arc(30 * 12, 30 * 12, 4, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		ctx.fillStyle = 'black'
		ctx.beginPath();
		ctx.arc(30 * 8, 30 * 8, 4, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
	}

	message_group.userList = function(data) {
		$(".userList_ele").remove()
		for (var i in data.userList) {
			if (data.userList[i].chess_status == 0) {
				data.userList[i].chess_status = "<span class='ue_status'>空闲</span>"
			}
			if (data.userList[i].chess_status == 1) {
				data.userList[i].chess_status = "<span class='ue_status' style='color:red;'>对局中</span>"
			}
			var html = "<div class='userList_ele'>" +
				"<span class='ue_userName'>" + data.userList[i].userName + "</span>" + data.userList[i].chess_status +
				"</div>"
			$("#userList_content").append(html)
		}
	}
	var sendData = function(){}
	var socket = new WebSocket('ws://127.0.0.1:4180');
	socket.onopen = function(event) {
		$("#hint_title").html('连接服务器成功！')
		$("#hintBox").hide();
		sendData = function(data){
			socket.send(data)
		}
		socket.onmessage = function(event) {
			var data = JSON.parse(event.data)
			message_group[data.flag](data)
		}
		socket.onclose = function(event) {
			console.log('连接被关闭')
		};
		socket.onerr = function(err) {
			console.log(err)
		}
		

		var cookie = cookieParser(document.cookie)
		var userName = cookie.userName;
		sendData(JSON.stringify({flag:'login',userName:userName}))
	}

})

function cookieParser(str){
	var cookieStr = str
	var cookieArr = (cookieStr || '').split(';');
	var cookieJson = {}
	for (var i in cookieArr) {
		cookieArr[i] = cookieArr[i].split('=')
		cookieJson[cookieArr[i][0]] = cookieArr[i][1]
	}
	return cookieJson;
}


