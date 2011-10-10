if(typeof nt=='undefined') {
	/**
	 * @namespace nt namespace object
	 */
	var nt = new Object();
}

//Ugly global but this is global to the page too
var popup = new pw.Popup();

nt.TestPage = function() {
	this.api = false;
	this.handler = null;
	this.method = null;
	this.lastResponse = false;
};
nt.TestPage.prototype.init = function() {
	var self = this;
	this.throbberOff();
	jQuery('#m3-tree').click(function() {
		if (self.lastResponse) self.print(self.lastResponse);
	});
	jQuery('#m3-print').click(function(){
		if (self.lastResponse) self.print(self.lastResponse);
	});
	jQuery('#m3-open-all').click(function(){
		self.openAll();
	});
	jQuery('#m3-close-all').click(function(){
		self.closeAll();
	});
	jQuery('#m3-search').click(function(){
		self.search();
	});
	this.createMemoryButtons();
}
nt.TestPage.prototype.reset = function() {
	if (! this.api) return;
	var form = jQuery('#m3-test-form')[0];
	if (form.suggest.checked) {
		form.data.value = this.method.queryString;
	}
	else {
		form.data.value = '';
	}
};

/**
 * Executes the command Query or UserQuery.
 * and prit the results.
 */
nt.TestPage.prototype.exec = function() {
	try {
		var self = this;
		this.throbberOn();
		this.clear();
		var form = jQuery('#m3-test-form')[0];
		
		if (form.url.value.indexOf("/data/") != 0 &&
			form.url.value.indexOf("/config/") != 0 &&
			form.url.value.indexOf("/app/") != 0 
			) {
			
			popup.alert("Error", "URL should start with /data/", $.callback(this, this.throbberOff));
			
			return;
		}
		
		var method = "GET";
		if (form.httpMethod[0].checked) method = 'GET';
		if (form.httpMethod[1].checked) method = 'POST';
		if (form.httpMethod[2].checked) method = 'DELETE';
		
		jQuery.ajax({
			url : form.url.value,
			type : method,
			data : form.data.value,
			success : function(response) {
				self.lastResponse = response;
				self.print(response);
			},
			error : function(err) {
				self.lastResponse = null;
				self.printSystemError(err);
			},
			complete : function(req) {
				self.throbberOff();
				self.printHeaders(req);
			}
		});
	} catch(err) {
		return false;
	}
};
/**
 * Resets the headers panel the treeview or text view and 
 * removes the JSON search buttons
 */
nt.TestPage.prototype.clear = function() {
	jQuery('#m3-headers').html('');
	jQuery('#m3-js-tree-view').html('');
	jQuery('#m3-tree-view').html('');
	jQuery('#m3-output').html('');	
	jQuery('#m3-buttons').css('visibility', 'hidden');	
};
/**
 * Prints the JSON, either as a TreeView or as text
 */
nt.TestPage.prototype.print = function(jsonObject) {
	try {
		this.clear();
		var form = jQuery('#m3-test-form')[0];
		if (form.viewType[0].checked) {
			jQuery('#m3-output').css('display', 'none');
			jQuery('#m3-buttons').css('visibility', 'visible');
			this.jsTreeView(jsonObject);
		} else {
			jQuery('#m3-output').css('display', 'block');
			jQuery('#m3-output').text(JSON.stringify(jsonObject), null, 4);
		}
	} catch (error) {
		jQuery('#m3-output').text('Error' + error);
	}
};
/**
 * Prints an m3_error
 */
nt.TestPage.prototype.printError = function(jsonObject) {
	var html = new jQuery.htmlBuffer();
	html.html('<div class="m3-region ui-state-error ui-corner-all">')
		.html('<span style="float: left; margin-right: 0.3em;" class="ui-icon ui-icon-info"></span>')
		.text(jsonObject.m3_error.code);
	if(jsonObject.m3_error.name != null) {
		html.text(' : ')
		    .text(jsonObject.m3_error.name);
	}
	if(jsonObject.m3_error.detail){
		if(jsonObject.m3_error.detail.trace) {
			html.html('<pre class="m3-trace">');
			html.text(jsonObject.m3_error.detail.trace);
			html.html('</pre>');
		}
		else {
			this.jsTreeView(jsonObject.m3_error.detail);
		}
	}
	html.html('</div>');
	jQuery('#m3-output').html(html.toString());
	jQuery('#m3-output').css('display', 'block');
};
nt.TestPage.prototype.printSystemError = function(response) {
	var html = new jQuery.htmlBuffer();
	html.html('<div class="m3-region ui-state-error ui-corner-all">')
		.html('<span style="float: left; margin-right: 0.3em;" class="ui-icon ui-icon-info"></span>')
		.html('<em>System error</em> ').text(response.status)
	    .html('</div>');
	jQuery('#m3-output').html(html.toString());
	jQuery('#m3-output').css('display', 'block');
};
/**
 * Prints an m3_condition
 */
nt.TestPage.prototype.printCondition = function(jsonObject) {
	var html = new jQuery.htmlBuffer();
	html.html('<div class="m3-region ui-state-highlight ui-corner-all">')
		.html('<span style="float: left; margin-right: 0.3em;" class="ui-icon ui-icon-alert"></span>')
		.text(jsonObject.m3_condition.code);
	if(jsonObject.m3_condition.name != null) {
		html.text(' : ')
		    .text(jsonObject.m3_condition.name);
	}
	if(jsonObject.m3_condition.detail) {
		this.jsTreeView(jsonObject.m3_error.detail);
	}
	html.html('</div>');
	jQuery('#m3-output').html(html.toString());
};
/**
 * Creates populates and displays the jQuery jsTree view
 */
nt.TestPage.prototype.jsTreeView = function(jsonObject) {
	//instantiate the TreeView control: 
	jQuery("#m3-js-tree-view").jstree({
		'core' : {animation: 250},
		'json_data'  : {
			'data' : [this.createJsTree(jsonObject)]
		}, 
		'plugins': ['themes', 'json_data', 'search']
	});
};
/**
 * expands all the nodes in the Treeview
 */
nt.TestPage.prototype.openAll = function() { 
	jQuery("#m3-js-tree-view").jstree('open_all', -1);
};
/**
 * Contracts or closes all the nodes
 */
nt.TestPage.prototype.closeAll = function() { 
	jQuery("#m3-js-tree-view").jstree('close_all', -1);
};
/**
 * Searches the tree for a given string
 */
nt.TestPage.prototype.search = function() {
	var text = jQuery("#m3-search-text").val();
	jQuery("#m3-js-tree-view").jstree("search", text);
};
/**
 * Convert an arbitrary JSON object to the JSON object supported by jstree.
 */
nt.TestPage.prototype.createJsTree = function (jsonObject) {
	var root = {data: "{}", state: 'open', children: new Array()};
	this.toJsTree(jsonObject, root.children, 0, true);
	return root;
};

nt.TestPage.prototype.toJsTree = function(jsonObject, children, depth, isObject) {
	for (var name in jsonObject) {
		var value = jsonObject[name];
		if (isObject) {
			name = name + ' : ';
		}
		else { // array
			name = '';
		}
		if ( 
			 (typeof value == "number") ||
			 (typeof value == "boolean")
		   ) {
			children.push({'data': name + value});
		}
		else if(typeof value == "string") {
			children.push({'data': name + '"' + this.escapeJava(value) + '"'});
		}
		else if(value == null) {
			children.push({data: name + 'null'});
		}
		else if(value instanceof Array ) {
			var node = {data: name + '[]', state: depth < 3 ? 'open' : 'closed', children: new Array()};
			children.push(node);
			this.toJsTree(value, node.children, depth + 1, false);
		}
		else if(value instanceof Object) {
			var node = {data: name + '{}', state: depth < 3 ? 'open' : 'closed', children: new Array()};
			children.push(node);
			this.toJsTree(value, node.children, depth + 1, true);
		}
	}
};
nt.TestPage.prototype.printHeaders = function(req) {
	var dom = jQuery('#m3-headers');
	try {
		var html = new jQuery.htmlBuffer();
		var date = req.getResponseHeader('Date');
		var expires = req.getResponseHeader('Expires');
		if(expires == null) {
			var ttl = 'Infinite';
		} else {
			var jDate = new Date(date);
			var jExpires = new Date(expires);
			var ttl = jExpires.getTime() - jDate.getTime();
		}
		html.html('<div>TTL: ').text(ttl).html('</div>');
		
		dom.html(html.toString());
	} catch(err) {
		dom.text('Headers not available:' + err);
	}
};

// Storage
nt.TestPage.prototype.memoryPlus = function(index) {
	var method = jQuery('#m3-test-form')[0].httpMethod;
	var toSave = {
		url : jQuery('#nt-url').val(),
		method : method[0].checked ? 0 : (method[1].checked ? 1 : 3),
		json : jQuery('#m3-input').val()
	};
	toSave = JSON.stringify(toSave);
	localStorage.setItem('idx' + index, toSave);
};
nt.TestPage.prototype.memoryRecall = function(index) {
	var saved = localStorage.getItem('idx' + index);
	if (saved) {
		saved = JSON.parse(saved);
		jQuery('#nt-url').val(saved.url);
		jQuery('#m3-test-form')[0].httpMethod[saved.method].checked = true;;
		jQuery('#m3-input').val(saved.json);
	}
};
nt.TestPage.prototype.createMemoryButtons = function() {
	var html = new jQuery.htmlBuffer();
	html.html('<ul id="nt-mem"><li>Memory</li>');

	html.html('<li>&nbsp;1: <a onclick="m3TestPage.memoryPlus(0)">M+</a> ');
	html.html('<a onclick="m3TestPage.memoryRecall(0)">MR</a></li>');

	html.html('<li>&nbsp;2: <a onclick="m3TestPage.memoryPlus(1)">M+</a> ');
	html.html('<a onclick="m3TestPage.memoryRecall(1)">MR</a></li>');

	html.html('<li>&nbsp;3: <a onclick="m3TestPage.memoryPlus(2)">M+</a> ');
	html.html('<a onclick="m3TestPage.memoryRecall(2)">MR</a></li>');

	html.html('</ul>');
	jQuery('#menu').append(html.toString());
};

//utils
nt.TestPage.prototype.throbberOn = function(){
	jQuery('.m3-throbber').attr('src', '/app/skin/img/throbber.gif');
};
nt.TestPage.prototype.throbberOff = function(){
	jQuery('.m3-throbber').attr('src', '/app/skin/img/blank.gif');
};
/**
 * replace \n and \t with HTML elements for new line and non-blanking space.
 */
nt.TestPage.prototype.escapeJava = function(string){
	string = string.replace(/\n/g, '<br/>');
	string = string.replace(/\t/g, '&nbsp;&nbsp;');
	return string;
};