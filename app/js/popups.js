/**
 * "popup" dialog using divs. implementes the classic alert, confirm and prompt methods and a generig popup which accepts any ol HTML.
 * Should not really be needed but FF and other browsers have added the annoying checkbox to the native widgets, permitting the user to
 * discard them and not permit any more.
 * 
 * however since this is CSS stylable it can also look much better.
 */


if(typeof pw=='undefined') {
	/**
	 * @namespace pw namespace object
	 */
	var pw = new Object();
}

/**
 * Constructor
 * 
 * @param div optional jQuery selector for a hidden div to which the html should be added.
 * 	if missing one is created with id "pw-popup" which can be positioned with CSS.
 * 
 */
pw.Popup = function(div) {
	this.div = div || null;
	this.type = null;
	this.callback = null;
};

pw.Popup.prototype.popup = function(html) {
	var elem = this.getDiv();
	elem.html(html);
	elem.css('display', 'block');
};

pw.Popup.prototype.alert = function(title, text, callback) {
	try {
		this.type = 'alert';
		this.callback = callback;
		var sb = new $.htmlBuffer();
		sb.html('<h3>');
		sb.text(title);
		sb.html('</h3>');
		if(text){
			sb.html('<div>').text(text).html('</div>');
		}
		sb.html('<form id="pw-popup-form">')
		  .html('<span id="pw-popup-buttons">')
		  .html('<input type="button" id="pw-popup-ok" value="OK"></input>')
		  .html('</span>')
		  .html('</form>');
		this.popup(sb.toString());
		jQuery('#pw-popup-form').submit(jQuery.callback(this, this.submit));
		jQuery('#pw-popup-ok').click(jQuery.callback(this, this.submit));
		jQuery('#pw-popup-ok').focus();
	} catch(err) {
		alert(err);
	}
};

pw.Popup.prototype.confirm = function(title, text, callback) {
	try {
		this.type = 'confirm';
		this.callback = callback;
		var sb = new $.htmlBuffer();
		sb.html('<h3>');
		sb.text(title);
		sb.html('</h3>');
		if(text){
			sb.html('<div>').text(text).html('</div>');
		}
		sb.html('<form id="pw-popup-form">')
		  .html('<span id="pw-popup-buttons">')
		  .html('<input type="button" id="pw-popup-ok" value="OK"></input>')
		  .html('<input type="button" id="pw-popup-cancel" value="Cancel"></input>')
		  .html('</span>')
		  .html('</form>');
		this.popup(sb.toString());
		jQuery('#pw-popup-ok').click(jQuery.closeArgs(this, this.submit, true));
		jQuery('#pw-popup-cancel').click(jQuery.closeArgs(this, this.submit, false));
		jQuery('#pw-popup-cancel').focus();
	} catch(err) {
		alert(err);
	}
};
pw.Popup.prototype.prompt = function(title, text , callback) {
	try {
		this.type = 'prompt';
		this.callback = callback;
		var sb = new $.htmlBuffer();
		sb.html('<h3>')
		  .text(title)
		  .html('</h3>');
		if(text){
			sb.html('<div>').text(text).html('</div>');
		}
		sb.html('<form id="pw-popup-form">')
		  .html('<input type="text" id="pw-popup-answer"></input><br/>')
		  .html('<span id="pw-popup-buttons">')
		  .html('<input type="button" id="pw-popup-ok" value="OK"></input>')
		  .html('<input type="button" id="pw-popup-cancel" value="Cancel"></input>')
		  .html('</span>')
		  .html('</form>');
		this.popup(sb.toString());
		jQuery('#pw-popup-form').submit(jQuery.callback(this, this.submit));
		jQuery('#pw-popup-ok').click(jQuery.callback(this, this.submit));
		jQuery('#pw-popup-cancel').click(jQuery.callback(this, this.dispose));
		jQuery('#pw-popup-answer').focus();
	} catch(err) {
		alert(err);
	}
};

pw.Popup.prototype.login = function(title, text, callback) {
	try {
		this.type = 'login';
		this.callback = callback;
		var sb = new $.htmlBuffer();
		sb.html('<h3>')
		  .text(title)
		  .html('</h3>');
		if(text){
			sb.html('<div>').text(text).html('</div>');
		}
		sb.html('<form id="pw-popup-form">')
		  .html('<label>Username</label><input type="text"     id="pw-popup-username"></input><br/>')
		  .html('<label>Password</label><input type="password" id="pw-popup-password"></input><br/>')
		  .html('<span id="pw-popup-buttons">')
		  .html('<input type="button" id="pw-popup-ok"     value="Login"></input>')
		  .html('<input type="button" id="pw-popup-cancel" value="Cancel"></input>')
		  .html('</span>')
		  .html('</form>');
		this.popup(sb.toString());
		jQuery('#pw-popup-form').submit(jQuery.callback(this, this.submit));
		jQuery('#pw-popup-ok').click(jQuery.callback(this, this.submit));
		jQuery('#pw-popup-cancel').click(jQuery.callback(this, this.dispose));
		jQuery('#pw-popup-username').focus();
	} catch(err) {
		alert(err);
	}
};


pw.Popup.prototype.submit = function(ok) {
	if (this.type == 'alert') {
		if (this.callback) {
			this.callback(ok);
		}
	}
	else if (this.type == 'confirm') {
		if (ok && this.callback) {
			this.callback(ok);
		}
	}
	else if (this.type == 'prompt') {
		var answer = jQuery('#pw-popup-answer').val();
		if (this.callback) {
			this.callback(answer);
		}
	}
	else if (this.type == 'login') {
		var username = jQuery('#pw-popup-username').val();
		var password = jQuery('#pw-popup-password').val();
		if (this.callback) {
			this.callback(username, password);
		}
	}
	this.dispose();
};

pw.Popup.prototype.dispose = function() {
	var div = this.getDiv();
	div.html('');
	div.css('display', 'none');
	this.type = null;
	this.callback = null;	
};

pw.Popup.prototype.getDiv = function() {
	if (this.div) {
		return this.div;
	}
	this.div = jQuery("#pw-popup");
	if (this.div.length == 0) {
		jQuery("body").append('<div id="pw-popup" style="display:none"/>');
		this.div = jQuery("#pw-popup");
	}
	return this.div;
};
