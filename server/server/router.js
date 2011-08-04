
var parse = require('url').parse;

var config = require('../util/config').configData;

var defaults = require('../http_mods/default');

var faviconModule =		require('../http_mods/favicon');
var restModule = 		require('../http_mods/rest');
var configModule = 		require('../http_mods/config');
var appModule = 		require('../http_mods/app');

/**
 * Router routes requests to the correct module.
 * It parses the URI and calls doGet or doPost of the modules.
 * TODO revers the roles modules should determine their own URI.
 */
route = function(request, response, chain) {
	try {
		
		var url = parse(request.url, true);
		
		if (url.pathname.indexOf('/data/') == 0) {
			service(restModule, request, response, url);
		}
		else if (url.pathname.indexOf('/app/') == 0) {
			service(appModule, request, response, url);
		}
		else if (url.pathname.indexOf('/favicon.png') == 0 ||  url.pathname.indexOf('/favicon.ico') == 0) {
			service(faviconModule, request, response, url);
		}
		else if (url.pathname.indexOf('/config/') == 0) {
			service(configModule, request, response, url);
		}
		else if (request.method == 'GET') {
			defaults.fileNotFound(response);
		}
		else {
			defaults.badRequest(response);
		}
	}
	catch (err) {
		console.dir(err);
		console.log("Router error: " + err);
	}
	
	chain.doFilter(request, response);
	
};

/**
 * select doGet or doPost for modules that might handle both
 */
service = function(module, request, response, url) {
	if (request.method == 'GET') {
		module.doGet(request, response, url);
	}
	else if (request.method == 'POST') {
		module.doPost(request, response, url);
	}
	else if (request.method == 'DELETE') {
		module.doDelete(request, response, url);
	}
};

exports.route = route;
exports.filter = route;
