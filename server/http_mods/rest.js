var path = require('path');
var fs = require('fs');

var defaults = 	require('./default');
var resolve = 	require('../persistence/file-resolve');
var config = 	require('../util/config.js').configData;


/**
 * Get the JSON file or, if a directory is supplied, list the json files in the directory.
 */
doGet = function(request, response, url) {
	
	defaults.addNoCacheHeaders(response);
	
	resolve.resolveData(url.pathname, true, function(fileSystemPath) {
		fs.stat(fileSystemPath, function(err, stat) {
			if (err) {
				response.writeHead(404, "NOT FOUND", {'Content-Type': 'application/json' });
				response.write(JSON.stringify({ok:false}));
				response.end();
				return;
			}
			
			/**
			 * Send a directory listing
			 */
			if (stat.isDirectory()) {
				
				fs.readdir(fileSystemPath, function(err, files) {
					if (err) {
						response.writeHead(404, "NOT FOUND", {'Content-Type': 'application/json' });
						response.write(JSON.stringify({ok:false}));
						response.end();
						return;
					}
					var json = {
							items : new Array()
					};
					for(var i = 0 ; i < files.length; i++) {
						var fileName= files[i];
						if ( fileName.indexOf('.') == 0 ) {
							continue;
						}
						if ( fileName.lastIndexOf('.json') == fileName.length - '.json'.length ) {
							var jsonName = fileName.substring(0, fileName.length - '.json'.length);
							if (jsonName.indexOf('.') == -1) {
								json.items.push(jsonName);
							}
						}
					}
					defaults.addNoCacheHeaders(response);
					response.setHeader("Content-Type", "application/json");
					response.write(JSON.stringify(json));
					response.end();
				});
			}
			/**
			 * Send the file as a JSON string
			 */
			else {
				fs.readFile(fileSystemPath, 'utf-8', function(err, data) {
					if (err) {
						defaults.fileNotFound(response);
						return;
					}
					defaults.addNoCacheHeaders(response);
					response.setHeader("Content-Type", "application/json");
					response.write(data);
					response.end();
				});
			}
			
		});
		
	});
	
};

/**
 * Create / Update a JSON file
 * 
 * This method parses and pretty prints the JSON it receives, it would be faster to remove this feature
 */
doPost = function(request, response, url) {
	
	resolve.resolveData(url.pathname, true, function(fileSystemPath) {
		
		var buffer = '';
		
		var dirname = path.dirname(fileSystemPath);
		
		request.on('data', function(data) {
			buffer += data;
		});
		
		request.on('end', function() {

			fs.mkdir(dirname, 0755, function(err) {

				var safeBean = JSON.parse(buffer); // check it is valid JSON
				
				fs.writeFile(fileSystemPath, JSON.stringify(safeBean, null, '\t'), 'utf-8', function(err, data) {
					
					if (err) {
						defaults.fileNotFound(response);
						return;
					}
					
					defaults.addNoCacheHeaders(response);
					
					var okJSON = '{"ok" : true}';
					
					response.writeHead(200, "OK", {
						"Content-Type" : "application/json",
						"Content-Length" : "" + Buffer.byteLength(okJSON, 'utf-8')
					});
					response.write(okJSON);
					response.end();
					
				});
				
			});
			
		});
		
	});
};

/**
 * Delete
 */
doDelete = function(request, response, url) {
	
	resolve.resolveData(url.pathname, true, function(fileSystemPath) {
		fs.unlink(fileSystemPath, function(err) {
			var okJSON = '{"ok" : true}';
			if (err) {
				okJSON = '{"ok" : false}';
			}
			response.writeHead(200, "OK", {
				"Content-Type" : "application/json",
				"Content-Length" : "" + Buffer.byteLength(okJSON, 'utf-8')
			});
			response.write(okJSON);
			response.end();
		});
		
	});
	
};

exports.doGet = doGet;
exports.doPost = doPost;
exports.doDelete = doDelete;
