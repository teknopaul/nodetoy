

module.exports.get = function(path, output, okCallback, errCallback) {
	resolve.resolveData(url.pathname, true, function(fileSystemPath) {
		fs.stat(fileSystemPath, function(err, stat) {
			if (err) {
				errCallback();
				return;
			}
			
			/**
			 * Send a directory listing
			 */
			if (stat.isDirectory()) {
				
				fs.readdir(fileSystemPath, function(err, files) {
					if (err) {
						errCallback();
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
					output.write(JSON.stringify(json));
					//response.end();
				});
			}
			/**
			 * Send the file as a JSON string
			 */
			else {
				fs.readFile(fileSystemPath, 'utf-8', function(err, data) {
					if (err) {
						errCallback(err);
						return;
					}
					output.write(data);
					//response.end();
				});
			}
			
		});
		
	});
};

module.exports.post = function(path, input, okCallback, errCallback) {
	
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
						errCallback();
						return;
					}
					
					okCallback();
					
				});
				
			});
			
		});
		
	});	
};

module.exports.del = function(path, okCallback, errCallback) {
	
	resolve.resolveData(url.pathname, true, function(fileSystemPath) {
		fs.unlink(fileSystemPath, function(err) {
			if (err) {
				errCallback();
				return;
			}
			okCallback();
		});
		
	});
	
};