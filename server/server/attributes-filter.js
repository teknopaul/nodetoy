
var parse = require('url').parse;

/**
 * You can tell I come from a Java background this filter adds a map of attributes to the request.
 * 
 */
filter = function(request, response, chain) {
	
	request.attributes = {};
	request.attributes.url = parse(request.url, true);
	
	chain.doFilter(request ,response);
	
};

exports.filter = filter;
