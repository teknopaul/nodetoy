if(typeof nt=='undefined') {
	/**
	 * @namespace nt namespace object
	 */
	var nt = new Object();
}


SECTIONS = ['work', 'life', 'shopping'];


/////// Model

nt.TodoModel = function() {
	this.sections = SECTIONS;
	this.data = {};
	for(var i = 0 ; i < this.sections.length ; i++) {
		var section = this.sections[i];
		this.data[section] = {
			name : section,
			todos : new Array()
		};
	}
};
nt.TodoModel.prototype.add = function(section, text) {
	this.data[section].todos.push(text);
};
nt.TodoModel.prototype.count = function(section) {
	if(typeof section == 'number') {
		section = SECTIONS[section];
	}
	return this.data[section].todos.length;
};


// end model //



//////// View //////// 

nt.TodoUI = function(controller, model) {
	this.controller = controller;
	this.model = model;
};

nt.TodoUI.prototype.feedback = function(message) {
	jQuery("#nt-messages").text(message);
};

nt.TodoUI.prototype.renderAll = function() {
	var dom = jQuery("#nt-todos");
	var html = new $.htmlBuffer();
	html.html('<div id="accordion">');
	for(var i = 0 ; i < this.model.sections.length ; i++) {
		var section = this.model.sections[i];
		html.html('<h3>').text(section).html('</h3>');
		html.html('<div>').html(this.renderSection(section, i)).html('</div>');
	}
	html.html('</div>');
	
	dom.html(html.toString());
	
	// bind adds
	for(var i = 0 ; i < this.model.sections.length ; i++) {
		jQuery("#add-todo-" + i).change($.closeArgs(this, this.handleAdd, i));
		jQuery("#add-todo-form-" + i).submit(this.halt);
	}
	this.bindDeletes();
};

nt.TodoUI.prototype.halt = function() {
	return false;
};

nt.TodoUI.prototype.renderSection = function(section, idx) {
	var todos = this.model.data[section].todos;
	var html = new $.htmlBuffer();
	html.html('<div class="section" id="section-' + idx + '">');
	for(var i = 0 ; i < todos.length ; i++) {
		// todo links and editable
		if (todos[i].indexOf("DONE") != 0) {
			html.html(this.renderTodo(todos[i], idx, i));
		}
	}
	html.html('<form id="add-todo-form-' + idx + '" onsubmit="return false;">')
		.html('<input type="text" id="add-todo-').text(idx).html('"></input>')
		.html('</form>');

	html.html('</div>');
	return html.toString();
};
nt.TodoUI.prototype.renderTodo = function(text, secIdx, todoIdx) {
	var html = new $.htmlBuffer();
	html.html('<div>')
		.html('<a href="delete" class="del" id="todo-' + secIdx + '-' + todoIdx + '" >x</a> ')
		.text(text)
		.html('</div>');
	return html.toString();
};

nt.TodoUI.prototype.bindDeletes = function(source) {
	jQuery(".del").click($.callback(this, this.handleDelete));
};
nt.TodoUI.prototype.handleDelete = function(e) {
	try {
		var todoId = e.target.id;
		var parts = todoId.split('-');
		this.markDone(parseInt(parts[1]), parseInt(parts[2]));
		jQuery("#" + todoId).parent().remove();
	} catch(err) {
		this.feedback(err);
	}
	return false;
};

nt.TodoUI.prototype.handleAdd = function(i) {
	try {
		var section = SECTIONS[i];
		var text = jQuery("#add-todo-" + i).val();
		this.addTodo(section, text);
		var html = this.renderTodo(text, i, this.model.count(section));
		var form = jQuery("#add-todo-form-" + i);
		form.before(html);
		this.bindDeletes();
	} 
	catch(err) {
		this.feedback(err);
	}
	return false;
};
nt.TodoUI.prototype.addTodo = function(section, text) {
	this.model.add(section, text);
	this.controller.serializeSection(section);
};

nt.TodoUI.prototype.markDone = function(section, idx) {
	if (typeof section == 'number') {
		section = SECTIONS[section];
	}
	var text = this.model.data[section].todos[idx];
	this.model.data[section].todos[idx] = "DONE " + text;
	this.controller.serializeSection(section);
};

// end View //

///////// Controller ///////// 

nt.Todo = function() {
	this.model = new nt.TodoModel;
	this.ui = new nt.TodoUI(this, this.model);
	this.loading = 0;
};
nt.Todo.prototype.init = function() {
	this.fetchAll();
};

// materialize methods //
nt.Todo.prototype.fetchAll = function() {
	this.loading = SECTIONS.length;
	jQuery.ajax({
		type : 'GET',
		url : '/data/todos/',
		success : $.callback(this, this.materializeAll),
		failure : $.closeArgs(this.ui, this.ui.feedback, "Error loading todos"),
	});
};

nt.Todo.prototype.materializeAll = function(response) {
	if (response.items) {
		var items = response.items;
		this.loading = items.length;
		for (var i = 0 ; i < items.length; i++) {
			this.fetchSection(items[i]);
		}
	}
};

nt.Todo.prototype.fetchSection = function(section) {
	var self = this;
	jQuery.ajax({
		type : 'GET',
		url : '/data/todos/' + section + '.json',
		success : function(response) {
			self.materializeSection(section, response);
		},
		failure : $.callback(this, this.loadError),
	});
};

nt.Todo.prototype.materializeSection = function(section, response) {
	this.loading--;
	this.model.data[section].todos = response;
	if (this.loading <= 0) {
		this.ui.renderAll();
	}
};

nt.Todo.prototype.loadError = function(message) {
	this.loading--;
	this.ui.feedback(message);
};

nt.Todo.prototype.feedback = function(message) {
	this.ui.feedback(message);
};

//materialize methods -end //

// serialize methods //
nt.Todo.prototype.serializeAll = function() {
	for(var i = 0 ; i < this.model.sections.length ; i++) {
		var section = this.model.sections[i];
		this.serializeSection(section);
	}
};
nt.Todo.prototype.serializeSection = function(section) {
	jQuery.ajax({
		type : 'POST',
		url : '/data/todos/' + section + '.json',
		data : JSON.stringify(this.model.data[section].todos),
		success : $.closeArgs(this, this.feedback, 'Saved'),
		failure : $.closeArgs(this, this.feedback, 'Error saving'),
	});
};
//serialize methods - end //



