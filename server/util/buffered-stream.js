    
/**
* Stream that will buffer writes, designed for piping.
* 
* Only supports strings.
* 
* Copied from
* https://github.com/polotek/morestreams/blob/mine/main.js which has no comments and I don't understand.
* 
* TODO this should be a better implementation of a WriteableStream, probably using Buffers and not string concatenating.
*/
    
/**
 * Constructor
 */
function BufferedStream (stream, limit) {
	this.stream = stream;
	this.limit = limit || 4096;
	this.buffer = '';
}

/**
 * Override the write() method to buffer the data
 */
BufferedStream.prototype.write = function (string) {
	this.buffer += string;
    if (this.buffer.length > this.limit) {
    	this.stream.write(this.buffer);
    	this.buffer = '';
    }
};

BufferedStream.prototype.flush = function () {
	this.stream.write(this.buffer);
	this.buffer = '';
};

BufferedStream.prototype.end = function () {
	this.stream.write(this.buffer);
	this.buffer = '';
	this.stream.end();
};

exports.BufferedStream = BufferedStream;

