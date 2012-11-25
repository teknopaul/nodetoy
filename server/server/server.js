var sys  = require("util");
var http = require("http");

var router = require("./router");
var init = require("./init");
var config = require("../util/config").configData;
var FilterChain = require("filter-chain").FilterChain;

var attributesFilter = 	require("../server/attributes-filter"),
//	logRequestFilter = 	require("../server/log-request-filter"),
	serverHeaderFilter = require("../server/server-header-filter"),
	rewriteFilter = 	require("rewrite"),
	routerFilter = 		require("../server/router");


var chainModules = [
	attributesFilter, 
//	logRequestFilter, 
	serverHeaderFilter,
	rewriteFilter,
	routerFilter
];

//rewriteFilter.setRules

var chain = new FilterChain(chainModules);

var startServer = function() {
	/**
	 * Contains the main loop and error handling for the server.
	 * 
	 * router.js directs requests to the correct module.
	 * 
	 */
	http.createServer(function(request, response) {
		try {
			chain.execute(request, response);
		}
		catch(err) {
			console.log("Unhandled error in req/resp handling:" + err);
		}
	
	}).listen(parseInt(config.port));
	
	console.log("> Running at http://127.0.0.1:" + config.port);
};

init.emitter.on('initialized', startServer);

init.init();

