var path = require('path');
var fs = require('fs');

var config = require('../util/config').configData;

// docs are shite on this attribute, win32 is observed win64 is guesswork
var windowsHacks = (process.platform == 'win32' || process.platform == 'win64');

/**
 * resolves HTML o CSS files
 */
resolveApp = function(pathname, forweb, callback) {

	//console.log("Resolving " + pathname);
	
	// get the real file's path avoiding ../ trickery
	pathname = path.normalize(pathname);
	if (pathname.indexOf('..') >= 0) {
		throw new Error("../ trickery");
	}
	
	if (windowsHacks) {
		pathname = pathname.replace(/\\/g, '/');
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
		throw new Error("../ trickery");
	}

	if (windowsHacks) {
		pathname = pathname.replace(/\\/g, '/');
	}

	// get base
	if (pathname.indexOf('/data/') == 0) {
		basedir = config.datadir;
		pathname = pathname.substring("/data".length);
	}
	else {
		console.log("Resolving missing base path " + pathname);
		throw new Error("Error resolving");
	}
	
	// get path in the filesystem
	var fileSystemPath = path.normalize(basedir + pathname);
	
	// TODO check for base validity
	callback(fileSystemPath);
};

exports.resolveData = resolveData;
exports.resolveApp = resolveApp;
