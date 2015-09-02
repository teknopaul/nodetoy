var fs = require('fs');
var path = require('path');

/**
 * mkdir -p for nodejs
 * @author substack
 */
var mkdirp = function(pathname, mode, cb, made) {
	if (!made) made = null;
	
	pathname = path.resolve(pathname);
	
	fs.mkdir(pathname, mode, function (er) {
		if (!er) {
			made = made || pathname;
			return cb(null, made);
		}
		switch (er.code) {
			case 'ENOENT':
				mkdirp(path.dirname(pathname), mode, function (er, made) {
					if (er) cb(er, made);
					   else mkdirp(pathname, mode, cb, made);
				});
				break;
				
				// In the case of any other error, just see if there's a dir
				// there already.  If so, then hooray!  If not, then something
				// is borked.
			default:
				fs.stat(pathname, function (er2, stat) {
					// if the stat fails, then that's super weird.
					// let the original error be the failure reason.
					if (er2 || !stat.isDirectory()) cb(er, made)
						else cb(null, made);
				});
				break;
		}
	});
};

exports.mkdirp = mkdirp;
