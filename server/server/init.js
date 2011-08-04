
/**
* Initialise stuff at boot that we dont want to always have to test for completion-
* 
* e.g. loading config files.
*/

var conf = require("../util/config");
var ssiEnv = require("../ssi/ssi-environment");
var EventEmitter = require('events').EventEmitter;


var emitter = new EventEmitter();
var initialized = false;

function init() {
	
	conf.emitter.on('configReady', function() {
		
		process.on('uncaughtException', function(error) {
			console.log("Unhandled error : " + error);
		});
		
		ssiEnv.emitter.on('envReady', function() {
			initialized = true;
			emitter.emit('initialized');
		});
		
	});
	
}

exports.initialized = initialized; 
exports.init = init;
exports.emitter = emitter;
