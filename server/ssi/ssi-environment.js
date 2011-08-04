

var twoDparser = require("../util/2d-xml2json");  
var EventEmitter = require('events').EventEmitter;

var emitter = new EventEmitter();
var env = {};

var parser = new twoDparser.Parser("../conf/ssi-environment.xml");

parser.parse(function() {
	var data = parser.getData();
	for(var prop in data) {
	    env[prop] = data[prop];
	}
	env.initialized = true;
	emitter.emit('envReady');
	console.log("SSI environment");
	console.dir(env);
});

/**
 * If we have already loaded call listener immediately
 */
emitter.on('newListener', function(listener, callback) { // undocumented node.js feature, 2nd arg is the function callback
	if (env.initialized) {
		callback(env);
	}
});

exports.env = env;
exports.emitter = emitter;
