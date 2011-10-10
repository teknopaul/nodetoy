
/**
 * Start the HTTP server.
 * 
 * PWD should be this directory.
 * 
 * server/server.js has the main HTTP server with the call to listen() and handles filters
 * server/router.js maps from request URLs to http_mods that implement the request handling 
 *   e.g /app/ > http_mods/app.js
 * persistence/file-resolve.js  defines how the file system is accessed based on URLs
 * 
 * http_mods/app.js serves static and HTML with SSI
 * http_mods/config.js  serves the configuration data as JSON
 * http_mods/rest.js handles GET POST DELETE requests for JSON 
 */
require("./server/server");

/**
 * Start the status socket, but not on windows
 */
var windowsHacks = (process.platform == 'win32' || process.platform == 'win64');

if (windowsHacks) {
	console.log("Kill with Ctrl + C");
}
else {
	require("./server/status-socket");
}
