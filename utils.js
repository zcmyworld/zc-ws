var utils = module.exports;

utils.cookieParser = function(str){
	var cookieStr = str
	var cookieArr = (cookieStr || '').split(';');
	var cookieJson = {}
	for (var i in cookieArr) {
		cookieArr[i] = cookieArr[i].split('=')
		cookieJson[cookieArr[i][0]] = cookieArr[i][1]
	}
	return cookieJson;
}