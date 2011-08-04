var path = 	require('path');
var fs = 	require('fs');
var util =  require('util');

var defaults = 	require('./default');
var config = 	require('../util/config.js').configData;

/**
 * Return the Table Of Contents as a fragment of HTML for AJAX requests.
 */
function doGet(request, response, url) {
	
	try {
		
		defaults.addNoCacheHeaders(response);

		var configJson = JSON.stringify(config);
		
		response.writeHead(200, "OK", {
			"Content-Type" : "application/json",
			"Content-Length" : "" + Buffer.byteLength(configJson, 'utf-8')
		});
		response.write(configJson);
		response.end();			
		
	} 
	catch(err) {
		
		console.error("Error sendig config : " +  url.pathname + " " + err);
		response.writeHead(400, "OK");
		response.end();
		
	}
	
};

exports.doGet = doGet;
