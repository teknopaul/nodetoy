var net = require('net');

/**
 * Control socket,
 *  
 * 	echo PING | nc -U /tmp/nodetoy.sock  # log an Alive   
 * 	echo EXIT | nc -U /tmp/nodetoy.sock  # process exits normally
 * 
 */
var statusSocket = net.createServer(function (c) {
	try{
		var string = '';
		c.on('data', function(buffer) {
			string += buffer.toString('utf-8');
		});
		
		c.on('end', function() {
			if (string.indexOf("PING") == 0) {
				console.log("Alive");
			}
			else if (string.indexOf("EXIT") == 0) {
				console.log("Going down");
				process.exit(0);
			}
		});
		
	}
	catch(err) {
		console.log(err);
	}
});
statusSocket.listen("/tmp/nodetoy.sock");

console.log("Listening to /tmp/nodetoy.sock");
