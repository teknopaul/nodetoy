/**
 * Utility class for generating HTML strings.
 * <br><br>
 * 
 * The idea of this class is that it is easy to use without introducing cross-site scripting
 * (XSS) security risks.
 * <br><br>
 * 
 * Any text that is constant HTML strings should be added to the buffer with the html()
 * method, similar to jQuerys' html() method.
 * <br><br>
 * 
 * Any untrusted values from JavaScript objects should be added with the text() method
 * similar to jQuerys text() method.
 * <br><br>
 * 
 * Be careful, writing html(obj.value) is still possible, and introduces XSS risks, just
 * as it does with jQuery.
 * <br><br>
 * 
 * <pre>
 *
 * var html = new $.htmlBuffer();
 * html.html('&lt;div&gt;blah&lt;/div&gt;')
 *     .text(data.someObject)
 *     .html('&lt;div&gt;blah&lt;/div&gt;')
 *     .toString();
 *     
 * </pre>
 * 
 * This class only escapes the following characters &amp; &lt; &gt; &quot; &apos;
 * Which means the page should be UTF-8 to be able to represent a full characterset.
 * For example the &euro; sign could be escaped as &amp;euro; but it is not, if you want support
 * for non UTF-8 JavaScript and HTML pages you need to put a lot more replacements into
 * the toHtml() method.
 * 
 * @class htmlBuffer
 */
jQuery.htmlBuffer = function() {
	this.buffer = '';
};
/**
 * Add HTML strings to the buffer, the string <b>will not be escaped</b>.
 * @param string a string of HTML
 * @return this
 */
jQuery.htmlBuffer.prototype.html = function(string) {
	this.buffer += string;
	return this;
};
/**
 * Add arbitrary values to the buffer.
 * If the value is a String, HTML entities such as &amp;
 * <b>will be escaped</b> to &amp;amp;
 * <br/><br/>
 * 
 * Numbers and booleans can also be added, and will have normal object toString representations
 * from string concatenation rules in JavaScript.
 * @param string an arbitrary String or any Object  
 * @return this
 */
jQuery.htmlBuffer.prototype.text = function(string) {
	this.buffer += this.toHtml(string);
	return this;
};
/**
 * return the whole buffer, as a string.
 */
jQuery.htmlBuffer.prototype.toString = function() {
	return this.buffer;
};
/**
 * Utility method to escape HTML entities.
 * 
 * Only the following values are escaped
 * &amp; &lt; &gt; &quot; &apos;
 * 
 * @private
 */
jQuery.htmlBuffer.prototype.toHtml = function(value) {
	if(typeof value == 'string') {
		value = value.replace(/&/g, '&amp;');
		value = value.replace(/</g, '&lt;');
		value = value.replace(/>/g, '&gt;');
		value = value.replace(/"/g, '&quot;');
		value = value.replace(/'/g, '&apos;');
	}
	return value;
};
