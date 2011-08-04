
var parse = require('url').parse;

/**
 *  filter logging the URL requested
 */
filter = function(request, response, chain) {
	
	var url = parse(request.url);
	console.log(request.method + " " + url.pathname);
	
	chain.doFilter(request, response);
	
};

exports.filter = filter;