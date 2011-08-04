
var ssiParser = require('../ssi/ssi-parser');
var ssi = require('../ssi/ssi-handler');

/**
 * Utility methods for SSI.
 */
processSsi = function(instream, response) {
	
	// set up SSI
	var handler = new ssi.SsiHandler();
	var parser = new ssiParser.Parser("SSI Util" , instream, response, handler);

	// exec
	parser.exec(function() {
		response.end();
	});
	
};

exports.processSsi = processSsi;
