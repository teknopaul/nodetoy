
/**
 * Start the HTTP server
 * PWD should be this directory.
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
