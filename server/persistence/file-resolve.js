var path = require('path');
var fs = require('fs');

var config = require('../util/config').configData;

/**
 * resolves HTML o CSS files
 */
resolveApp = function(pathname, forweb, callback) {

	//console.log("Resolving " + pathname);
	
	// get the real file's path avoiding ../ trickery
	pathname = path.normalize(pathname);
	if (pathname.indexOf('..') >= 0) {
		throw {error : "../ trickery"};
	}
	
	// get base
	if (pathname.indexOf('/app/') == 0) {
		basedir = config.datadir;
		pathname = pathname.substring("/app".length);
	}
	
	if (pathname.charAt(0) != '/') {
		pathname = '/' + pathname;
	}
	
	// get base
	var basedir = config.basedir;

	// get path in the filesystem
	var fileSystemPath = path.normalize(basedir + pathname);
	
	// TODO check for base validity
	callback(fileSystemPath);
};
/**
 * convert a URL starting with /data/ to a FS path
 */
resolveData = function(pathname, forweb, callback) {

	// get the real file's path avoiding ../ trickery
	pathname = path.normalize(pathname);
	if (pathname.indexOf('..') >= 0) {
		throw {error : "../ trickery"};
	}
	
	// get base
	if (pathname.indexOf('/data/') == 0) {
		basedir = config.datadir;
		pathname = pathname.substring("/data".length);
	}
	else {
		console.log("Resolving missing base path " + pathname);
		throw  {error : "Error resolving"};
	}
	
	// get path in the filesystem
	var fileSystemPath = path.normalize(basedir + pathname);
	
	// TODO check for base validity
	callback(fileSystemPath);
};

exports.resolveData = resolveData;
exports.resolveApp = resolveApp;
