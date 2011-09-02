
var defaults = require('../http_mods/default');

/**
 *  "Servlet" filter for adding the default headers
 */

filter = function(request, response, chain) {
	
	response.setHeader("Server", "rierteta.org_nodetoy/0.1");
	
	chain.doFilter(request, response);
};

exports.filter = filter;