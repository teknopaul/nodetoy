 
/**
 * jQuery Closure plugin.
 *
 * <br>Copyright (c) 2010 Paul Hinds
 * <br>Dual licensed under the MIT and GPL licenses:
 * <br>http://www.opensource.org/licenses/mit-license.php
 * <br>http://www.gnu.org/licenses/gpl.html
 * @fileoverview
 */

/**
 * Can be used to reduce closure on a function.
 * <br/>
 * e.g.
 * <pre>
 * 
 * jQuery('#theId').click($.callback(this, this.myEventHandler));
 * 
 * </pre>
 * instead of this pattern
 * <pre>
 * var html = '&lt;div id="theId"&gt;&lt;div&gt;';
 * jQuery('somthing').html(html);
 * jQuery('#theId').click(function(){
 *   this.myEventHandler();
 * });
 * 
 * </pre>
 * which creates a closure on the unwanted html variable.
 * <br/>
 * Only two parameters may be given to this method, the method will be run with 
 * the arguments of the code that calls the callback.
 * 
 * @param object the context object for the method call
 * @param method the function to be called with parenthasis
 * @static
 */
jQuery.callback = function(object, method){
    return function() {
       return method.apply(object, arguments);
    };
};


/**
 * Closes a function and its arguments.
 * <br/><br/>
 * e.g.
 * <br/> 
 * <pre>
 * for(i=0; i<=5 ; i++) {
 * 	  jQuery('#id' + i).click($.closeArgs(this, this.myEventHandler, i, value));
 * }
 * </pre>
 * 
 * The <code>i</code> and the <code>value</code> variables will remain as expected.
 * <br/><br/>
 * 
 * With the following code, i is always 5 because the same variable becomes part of the function's
 * closure.
 * <pre>
 * for(i=0; i<=5 ; i++) {
 * 	  jQuery('#theId').click(function(e){
 * 		myEventHandler(i, value);
 * 	  }
 * }
 * </pre>
 * Any number of arguments may be given to this method but the callback's arguments will be 
 * lost. In the example above <code>e</code> is the lost argument.
 * 
 * @param object the context object for the method call
 * @param method the function to be called with parenthasis
 * @param var_args any number of additional parameters may be added and will be added to the closure
 * @static
 */
jQuery.closeArgs = function(object, method) {
	var args = Array.prototype.slice.call(arguments, 2);
	return function(){
		return method.apply(object, args);
	};
};