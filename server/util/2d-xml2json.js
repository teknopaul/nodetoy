/**
 * Parses an XML file and returns the data as a Javascript object loosing comments and whitespace.
 * 
 * <xml>
 *    <myname>myvalue<myname>
 * </xml>
 * 
 * becomes 
 * {
 * 	myname : myvalue,
 * }
 * 
 * If this class is run with nested XML elements results are unpredictable, hence "2d".
 * 
 */

var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var sax = require("sax"),
  strict = true, // set to false for html-mode
  parser = sax.parser(strict);

/**
 * @constructor
 */
var Parser = function(fileName) {
	this.fileName = fileName;
	this.data = {};
};

Parser.prototype.parse = function(callback) {
	var self = this;
	var tagState = '';

	parser.onerror = function (err) {
		callback("error", err);
	};
	parser.ontext = function (text) {
		if (text.trim().length == 0) {
			return;
		}
		self.data[tagState] = text;
	};
	parser.onopentag = function (node) {
		tagState = node.name;
	};
	parser.onend = function () {
		callback("ok", self.data);
	};

	fs.readFile(this.fileName, function (err, data) {
		if (err) {
			callback("error", err);
		} else {
			parser.write(data.toString('utf8')).close();
		}
	});
};

Parser.prototype.getData = function() {
	return this.data;
};

exports.Parser = Parser;
