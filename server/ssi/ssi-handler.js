var fs = require('fs');

var ssiParser = require('./ssi-parser');
var ssiEnvironment = require('./ssi-environment');
var config = require('../util/config.js').configData;

var resolve = require('../persistence/file-resolve');

/**
 * SSI handler to include files and variables and perform some SSI operations,
 *  but not all Apache SSI operations are supported.
 * @param a map of strings for SSI environment
 * @param resolver an object that exposes 2 methods 
 * 	resolve(pathname, boolean, callback)
 *  resolveApp(pathname, boolean, callback)  
 * for locating filesystem files from relative paths  resolveApp handles paths that begin with /app
 */
SsiHandler = function(ssiEnv, resolver) {
	var self = this;
	// must have not state that is not Global instance is reused-
	this.ssiEnv = ssiEnv; // SSI environment,  name value pairs
	this.resolver = resolver || resolve;

	if (typeof ssiEnv == 'undefined') this.ssiEnv = ssiEnvironment.env;

	/**
	 * Write the value of an environment variable no need to pause processing.
	 */
	this.ssiEcho = function(attributes, parser, outstream) {
		try {
			var attName = attributes['var'];
			var value = self.ssiEnv[attName];
			outstream.write(value);
		} catch(err) {
			console.log("Error in ssi echo");
		}
	};
	/**
	 * Write the value of an environment variable no need to pause processing.
	 */
	this.ssiSet = function(attributes, parser, outstream) {
		var attName = attributes['var'];
		var attValue = attributes['value'];
		self.ssiEnv[attName] = attValue;
	};
	/**
	 * File last modified.
	 */
	this.ssiFlastmod = function(attributes, parser, outstream) {
		parser.pause();
		var resolveMethod = self.resolver.resolveApp;

		resolveMethod(attributes['file'], false, function(fileSystemFile) {
			fs.stat(fileSystemFile, function (err, stats) {
				if (err) {
					outstream.write("<!-- flastmod failed -->");
				}
				else {
					outstream.write(mtime);
				}
				parser.resume();
			});
		});
	};
	/**
	 * Include a file from a remote server of from this server over HTTP.
	 * TODO right now this is a synonym of file
	 */
	this.ssiIncludeVirtual = function(virtual, parser, outstream) {
		//outstream.write("<!-- virtual not implemented yet -->");
		this.ssiIncludeFile(virtual, parser, outstream);
	};
	/**
	 * Include a local file
	 */
	this.ssiIncludeFile = function(file, parser, outstream) {
		//console.log("Including: " + file);
		parser.pause();
		try {
			var resolveMethod = self.resolver.resolveApp;

			resolveMethod(file, false, function(fileSystemFile) {
				//console.log("Parsing: " + fileSystemFile);
				var instream = fs.createReadStream(fileSystemFile , { flags: 'r'});
				instream.on('error', function() {
					//console.log("Nested parse error");
					outstream.write("<!-- error processing SSI include  " + file + "  -->");
					//fs.close(instream.fd);
				});
				
				var nestedParser = new ssiParser.Parser("Inner parser", instream, outstream, self);// Reusing this instance of SsiHandler
				nestedParser.exec(function() {
					//console.log("Finished inner parse");
					parser.resume();
					// this throws errors presumably stream is auto-closed somehow, can't find any documentation stating it is.
					//fs.close(instream.fd);
				});
			});
		}
		catch(err) {
			console.log("Nested parse error in " + file);
			parser.resume();
		}
	};
	
	/**
	 * Return the attributes from a SSI statement.
	 * @throws Error if the attributes do not parse correctly
	 */
	this._processAttributes = function(attributes) {
		var atts = {};
		var inName = true;
		var inValue = false;
		var currName = '';
		var currValue = '';
		
		for (var i = 0 ; i < attributes.length ; i++) {
			var c = attributes.charAt(i);
			if (inName && c == '=') {
				inName = false;
				while (attributes.charAt(++i) == ' '); // skip whitespace and first "
				if (attributes.charAt(i) != '"') {
					throw new Error("Syntax error parsing " + attributes);
				}
				else {
					inValue = true;
				}
				//console.log("Found currName " + currName);
				continue;
			}
			else if (inName) {
				currName += c;
			}
			else if (inValue && c == '"' ) {
				//console.log("Found currValue " + currValue);
				atts[currName.trim()] = currValue.trim();
				//console.log('Found attr ' + currName + '="' + currValue + '"');
				currName = '';
				currValue = '';
				inName = true;
				inValue = false;

			}
			else if (inValue) {
				currValue += c;
			}
		}	
		return atts;
	};
	
	/**
	 * Parse the <!--#type name="value" name2="value" -->  syntax
	 */
	this._processStatement = function(ssiStatement) {
		var typeStart = "<!--#".length;
		var typeEnd = ssiStatement.indexOf(' '); // <!--#echo var="foo"/>  the first space is required <|--#echo/> will generate an error
		if (typeEnd < 0) {
			console.log("Invlaid SSI statement missing space " + ssiStatement);
			return { type : "error", attributes : {}};
		}
		return {
			type : ssiStatement.substring(typeStart, typeEnd),
			attributes : this._processAttributes(ssiStatement.substring(typeEnd, ssiStatement.length - 3))
		};
	};

	/**
	 * Match function processes SSI include statements when found in the body of a document.
	 */
	this.match = function(parser, ssiStatement, outstream) {
		
		try {
			var ssi = this._processStatement(ssiStatement);
			
			//console.dir(ssi);
			
			if (ssi.type == 'include') {
				if (typeof ssi.attributes.file != 'undefined') {
					this.ssiIncludeFile(ssi.attributes.file, parser, outstream);
				}
				else if (typeof ssi.attributes.virtual != 'undefined') {
					this.ssiIncludeVirtual(ssi.attributes.virtual, parser, outstream);
				}
			}
			else if (ssi.type == 'echo') {
				this.ssiEcho(ssi.attributes, parser, outstream);
			}
			else if (ssi.type == 'flastmod') {
				this.ssiFlastmod(ssi.attributes, parser, outstream);
			}
			else if (ssi.type == 'set') {
				this.ssiSet(ssi.attributes, parser, outstream);
			}
			else {
				console.log("Unsupported SSI directive " + ssi.type );
			}
		}
		catch (err) {
			console.log("Error processing SSI " + err);
		}
		
	};
};

exports.SsiHandler = SsiHandler;
