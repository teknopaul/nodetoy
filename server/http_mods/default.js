var fs = require('fs');

var date = require("../util/date.js");
var ssiUtil = require("../ssi/ssi-util.js");

/**
 * Static functions for adding standard headers and standard responses.
 * 
 * Also includes mime magic.
 * 
 * @param response
 */

function addDefaultHtmlHeaders(response) {
	response.setHeader("Content-Type", "text/html;charset=utf8");
};

function addNoCacheHeaders(response) {
	response.setHeader("Cache-control", "no-cache");
	response.setHeader("Expires", "Fri, 10 Jun 2011 23:23:23 GMT");
};

function addCache1DayHeaders(response) {
	response.setHeader("Cache-control", "public");
	var expires = new Date();
	expires.setTime(expires.getTime() + (1000 * 60 * 60 * 24));
	response.setHeader("Expires", date.toHttpDate(expires));
};

function mimeMagic(response, pathname) {
	if (pathname.lastIndexOf(".html") == pathname.length - 5) {
		response.setHeader("Content-Type", "text/html;charset=utf8");
		return "text/html";
	}
	else if (pathname.lastIndexOf(".htm") == pathname.length - 4) {
		response.setHeader("Content-Type", "text/html;charset=utf8");
		return "text/html";
	}
	else if (pathname.lastIndexOf(".shtml") == pathname.length - 6) {
		response.setHeader("Content-Type", "text/html;charset=utf8");
		return "text/html";
	}
	else if (pathname.lastIndexOf(".css") == pathname.length - 4) {
		response.setHeader("Content-Type", "text/css");
		return "text/css";
	}
	else if (pathname.lastIndexOf(".js") == pathname.length - 3) {
		response.setHeader("Content-Type", "text/javascript");
		return "text/javascript";
	}
	else if (pathname.lastIndexOf(".png") == pathname.length - 4) {
		response.setHeader("Content-Type", "image/png");
		return "image/png";
	}
	else if (pathname.lastIndexOf(".gif") == pathname.length - 4) {
		response.setHeader("Content-Type", "image/gif");
		return "image/gif";
	}
	else if (pathname.lastIndexOf(".jpg") == pathname.length - 4) {
		response.setHeader("Content-Type", "image/jpeg");
		return "image/jpeg";
	}
	else if (pathname.lastIndexOf(".jpeg") == pathname.length - 4) {
		response.setHeader("Content-Type", "image/jpeg");
		return "image/jpeg";
	}
	else if (pathname.lastIndexOf(".json") == pathname.length - 5) {
		response.setHeader("Content-Type", "application/json");
		return "application/json";
	}
	else {
		response.setHeader("Content-Type", "text/plain");
		return "text/plain";
	}
};

function mimeMagicIsText(pathname) {
	if (pathname.lastIndexOf(".html") == pathname.length - 5) {
		return true;
	}
	else if (pathname.lastIndexOf(".htm") == pathname.length - 4) {
		return true;
	}
	else if (pathname.lastIndexOf(".shtml") == pathname.length - 6) {
		return true;
	}
	else if (pathname.lastIndexOf(".css") == pathname.length - 4) {
		return true;
	}
	else if (pathname.lastIndexOf(".js") == pathname.length - 3) {
		return true;
	}
	else if (pathname.lastIndexOf(".json") == pathname.length - 5) {
		return true;
	}
	return false;
};
/**
 * Return a 404
 */
function fileNotFound(response) {
	response.writeHead(404, "NOT FOUND", {'Content-Type': 'text/html' });
	var instream = fs.createReadStream('../app/404.html');
	ssiUtil.processSsi(instream, response);
};

function serverError(response) {
	response.writeHead(500, "SERVER ERROR", {'Content-Length': 0,
										  	 'Content-Type': 'text/plain' });
	response.end();
};

function badRequest(response) {
	response.writeHead(400, "BAD REQUEST", {'Content-Length': 0,
										  	'Content-Type': 'text/plain' });
	response.end();
};

function forbidden(response) {
	response.writeHead(403, "FORBIDDEN", {'Content-Length': 0,
										 	'Content-Type': 'text/plain' });
	response.end();
};

function found(response, location) {
	response.writeHead(302, "FOUND", {'Content-Length': 0,
										'Location': location });
	response.end();
};

exports.addDefaultHtmlHeaders = addDefaultHtmlHeaders;
exports.addNoCacheHeaders = addNoCacheHeaders;
exports.addCache1DayHeaders = addCache1DayHeaders;
exports.mimeMagic = mimeMagic;
exports.mimeMagicIsText = mimeMagicIsText;

exports.fileNotFound = fileNotFound;
exports.serverError = serverError;
exports.badRequest = badRequest;
exports.found = found;
exports.forbidden = forbidden;
