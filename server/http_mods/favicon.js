var path = require('path');
var fs = require('fs');

var defaults = require('./default');

/**
 * Stream the favicon.ico,  
 * the file /app/favicon.png is returned.
 */
function doGet(request, response, url) {
	
	var instream = fs.createReadStream("../app/favicon.png" , { flags: 'r', bufferSize: 2 * 1024 });

	// set default HTTP headers
	response.statusCode = 200;
	response.setHeader("Content-Type", "image/png");
	
	defaults.addNoCacheHeaders(response);
	
	// TODO should not chunk
	instream.pipe(response);
	
};





exports.doGet = doGet;
