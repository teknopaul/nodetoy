var path = require('path');
var fs = require('fs');

var defaults = require('./default');
var resolve = require('../persistence/file-resolve');
var ssiParser = require('../ssi/ssi-parser');
var ssi = require('../ssi/ssi-handler');

/**
 * Stream a named file to the response.
 * 
 * Parses SSI if the data is HTML, also handles some mime types such as CSS and PNG.
 * 
 * To support more mime types modify mimeMagic() in defaults.js
 * 
 * This is the module that streams the client side APP to the browser, it is pretty much a simple
 * Apache with SSI.
 */
function doGet(request, response, url) {

	resolve.resolveApp(url.pathname, true, function(fileSystemPath) {

		// set default HTTP headers
		response.statusCode = 200;
		var mime = defaults.mimeMagic(response, url.pathname);
		response.setHeader("Content-Type", mime);
		defaults.addNoCacheHeaders(response);

		// open the file
		var instream = null;
		if ( defaults.mimeMagicIsText(url.pathname) ) {
			instream = fs.createReadStream(fileSystemPath, { flags: 'r', encoding: 'utf8' });
		} else {
			instream = fs.createReadStream(fileSystemPath);
		}
		
		instream.on('error', function() {
			// TODO this is not correct FNF should be detected some other way
			defaults.fileNotFound(response);
			return;
		});
		
		
		// If it is HTML parse SSI 
		if (mime == "text/html") {
			
			response.setHeader("Content-Type", "text/html;charset=utf-8");
			
			// set up SSI
			var handler = new ssi.SsiHandler();
			var parser = new ssiParser.Parser("Http Server" , instream, response, handler);
		
			// exec
			parser.exec(function(message) {
				response.end();
			});
		}
		// otherwise stream the response as is.
		else {
			instream.pipe(response);
		}
		
	});
	
};


exports.doGet = doGet;
