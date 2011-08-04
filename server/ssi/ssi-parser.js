
var BufferedStream = require('../util/buffered-stream').BufferedStream;

/**
 * Parser to read a Stream and catch <!--# style SSI directives and pass to the SSI handler.
 */
Parser = function(name, instr, outstr, ssiHandler) {
	var self = this;

	this.name = name;
	this.initialized = false;
	this.instream = instr;  // Input stream
	this.data = null;
	this.outstream = new BufferedStream(outstr); // Output stream
	this.ssiHandler = ssiHandler;
	
	// vars for matching the <!-- include="blah.html" >  line
	this.buffer = ''; // max line length
	this.matching = false;
	this.inSSI = false;
	this.matchPos = 0;
	this.matchString = '<!--#';
	
	// vars for pause continue
	this.paused = false;
	this.pausePos = 0;
	this.infin = false; // input stream finished, if we are paused we delay propagating the 'end' event
	this.finCallback; // the callback to send when we have finished processing all the 'data' events)
	
	/**
	 * Carry on processing the data, from position pos.
	 * @return true if all the data was consumed, false if we were paused in the middle.
	 */
	this.doContinue = function(pos) {
		try {
			for (var i = pos ; i < this.data.length ; i++) {
				this.pausePos = i;
				
				var c = this.data.charAt(i);
				
				// found a match looking for end of SSI statement
				if (this.inSSI && c == '>') {
					this.buffer += c;
					//console.log("Found SSI: " + this.pausePos);
					this.ssiHandler.match(this, this.buffer, this.outstream); // client can pause
					this.resetMatching();
					if (this.paused) {
						return false;
					}
					else {
						continue;
					}
				}
				else if (this.inSSI) {
					this.buffer += c;
					continue;
				}
				
				
				if (c == '<') {
					this.matching = true;
					this.matchPos = 1;
					this.buffer += c;
					continue;
				}
				// finding a match, buffer what we find
				if (this.matching && this.matchString.charAt(this.matchPos) == c) {
					
					this.matchPos++;
					this.buffer += c;
					if (this.matchPos == this.matchString.length) {
						this.inSSI = true;
					}
					continue;
				}
				else if (this.matching) {
					this.matching = false;
					this.buffer += c;
					this.outstream.write(this.buffer);
					this.buffer = '';
				}
				else {
					this.outstream.write(c);
				}
			}
			return true;
		} catch(err) {
			console.error("Error parsing " + err);
		}
	};
	
	this.pause = function() {
		//console.log("Parser paused: @" + this.pausePos);
		this.pausePos++;
		this.paused = true;
		this.instream.pause();
	};
	
	this.resume = function() {
		//console.log("Parser resumed: @" + this.pausePos + " data="+ this.data.charAt(this.pausePos));
		this.paused = false;
		if ( this.doContinue(this.pausePos) ) {
			if (this.infin) {
				this.inputEnded();
			} else {
				this.instream.resume();
			}
		}
	};
	
	this.resetMatching = function() {
		this.buffer = ''; // max line length
		this.matching = false;
		this.matchPos = 0;
		this.inSSI = false;
	};
	
	this.flush = function() {
		this.outstream.flush();
	};

	this.inputEnded = function() {
		if ( ! this.paused ) {
			if (this.inSSI == true) {
				console.log("Unterminated SSI statement");
			}
			this.flush();
			this.finCallback.apply(self, ['end']);
		}
	};
	
	

	this.exec = function(callback) {
		
		this.finCallback = callback;
		
		this.instream.setEncoding("utf8");
		
		this.instream.on('error', function(err) {
			console.error("Error received in parser " + self.name + ":" +err);
			self.flush();
			callback.apply(self, ['error']);
		});
	
		this.instream.on('end', function() {
			self.infin = true;
			self.inputEnded();
		});
	
		this.instream.on('data', function(data) {
			// console.log(this.name + " on data " + data);
			self.data = data;
			self.pausePos = 0;
			self.doContinue(0);
		});
		
	};

};
exports.Parser = Parser;
