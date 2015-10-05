
class Command {
	constructor({commands, afterExecute, afterUndo, thisArg}) {
		this._commands = commands;

		//optional
		this._thisArg = thisArg;
		this._afterExecute = afterExecute;
		this._afterUndo = afterUndo;
	}

	execute() {
		for(let command of this._commands) {
			command.execute();
		}
		if (this._afterExecute) {
			this._afterExecute.call(this._thisArg, ret);
		}
	}

	undo() {
		for(let i = this._commands.length-1; i >= 0; i--){
			let command = this._commands[i];
			command.undo();
		}
		if (this._afterUndo) {
			this._afterUndo.call(this._thisArg, ret);
		}
	}

	set afterExecute(afterExecute) {
		this._afterExecute = afterExecute;
	}
	set afterUndo(afterUndo) {
		this._afterUndo = afterUndo;
	}

	appendCommand({command}){
		this._commands.push(command);
		return this;
	}
	appendCommands({commands}){// commands is an array of commands
		Array.prototype.push.apply(this._commands, commands);
		return this;
	}
}

class AtomicCommand extends Command {
	constructor({execute, undo, thisArg, afterExecute, afterUndo}) {
		super({commands: [], afterExecute, afterUndo, thisArg});


		this._execute = execute;
		this._undo = undo;
	}

	execute() {
		let ret = this._execute.call(this._thisArg);
		if (this._afterExecute) {
			this._afterExecute.call(this._thisArg, ret);
		}
	}

	undo() {
		let ret = this._undo.call(this._thisArg);
		if (this._afterUndo) {
			this._afterUndo.call(this._thisArg, ret);
		}
	}

	// NOTE: this method retruns a new command that contains 'this' and the given command and do not change 'this'
	appendCommand({command}){
		return new Command({
			commands : [this, command]
		});
	}

	// NOTE: this method retruns a new command that contains 'this' and the given commands and do not change 'this'
	appendCommands({commands}){
		return new Command({
			commands : [this, ...commands]
		});
	}
}

class CommandFactory {
	constructor({events, linkImport, scriptManager}) {
		this.events = events;
		this.linkImport = linkImport;
		this.scriptManager = scriptManager;
	}

	prependElement({element, elementRef}) {
		let parent = elementRef.parentElement;
		let events = this.events;
		let execute = function() {
			parent.insertBefore(element, elementRef);
			events.emit('GUID.dom.element.append', {
				parent, child: element, elementRef
			});
		};
		let undo = function() {
			parent.removeChild(element);
			events.emit('GUID.dom.element.remove', {
				parent, child: element
			});
		};

		return new AtomicCommand({
			execute, undo
		});
	}

	changeElementText({text, element}){
		let events = this.events;

		let childNodes = element.childNodes;
		let command;
		if(childNodes.length > 1){
			console.error('not yet implemented, the command returned will be null');
			command = null;
		}else{
			let execute, undo;

			if (childNodes.length === 0) {
			 let oldVal = element.innerText;
			 execute = function(){
				 element.innerText = text;
				 events.emit('GUID.dom.element.changeText', {
					 element, text
				 });
			 };
			 undo = function(){
				 element.innerText = oldVal;
				 events.emit('GUID.dom.element.changeText', {
					 element, text: oldVal
				 });
			 }
		 }else /*if (childNodes.length === 1)*/ {
			 let oldVal = childNodes[0].nodeValue;
			 execute = function(){
				 element.innerText = text;
				 events.emit('GUID.dom.element.changeText', {
					 element, text
				 });
			 };
			 undo = function(){
				 childNodes[0].nodeValue = oldVal;
				 events.emit('GUID.dom.element.changeText', {
					 element, text: oldVal
				 });
			 }
		 }

		 command = new AtomicCommand({execute, undo});
		}

		return command; //it can be null if the element contains other elements
	}

	appendElement({parent, child}) {
		let events = this.events;

		let execute = function() {
			parent.appendChild(child);
			events.emit('GUID.dom.element.append', {
				parent, child
			});

			return {
				parent, child
			};
		};
		let undo = function() {
			parent.removeChild(child);
			events.emit('GUID.dom.element.remove', {
				parent, child
			});

			return {
				parent, child
			};
		};

		return new AtomicCommand({
			execute, undo
		});
	}

	removeElement({element}) {
		let events = this.events;

		let nextNode = element.nextSibling;
		let parent = element.parentElement;

		let execute = function() {
			parent.removeChild(element);
			events.emit('GUID.dom.element.remove', {
				parent, child: element
			});

			return {
				parent, child: element
			};
		};
		let undo = function() {
			parent.insertBefore(element, nextNode);
			events.emit('GUID.dom.element.append', {
				parent, child: element
			});

			return {
				parent, child: element
			};
		};

		return new AtomicCommand({
			execute, undo
		});
	}

	changeAttribute({element, attribute, value}) {
		let oldValue = element.getAttribute(attribute);
		let events = this.events;

		let execute = function() {
			element.setAttribute(attribute, value);
			events.emit('GUID.dom.attribute.change', {
				element, attribute, oldValue, value
			});
		};
		let undo = function() {
			if (oldValue) {
				element.setAttribute(attribute, oldValue);
				events.emit('GUID.dom.attribute.change', {
					element, attribute, oldValue: value, value: oldValue
				});
			} else {
				element.removeAttribute(attribute);
				events.emit('GUID.dom.attribute.remove', {
					element, attribute
				});
			}
		};

		return new AtomicCommand({
			execute, undo
		});
	}

	toggleClass({ element, className, forceAddRem }) {
		let events = this.events;

		let classList = element.classList;
		let exists = classList.contains(className);

		let addClass = function() {
			classList.add(className);
			events.emit('GUID.dom.class.add', {
				element, className
			});
		};
		let removeClass = function() {
			classList.remove(className);
			events.emit('GUID.dom.class.remove', {
				element, className
			});
		};

		let execute, undo;

		if (forceAddRem === true) { // add
			[execute, undo] = [addClass, removeClass];
		} else if (forceAddRem === false) { // remove
			[execute, undo] = [removeClass, addClass];
		} else if (forceAddRem === undefined) { //toggle
			if (exists) {
				[execute, undo] = [removeClass, addClass];
			} else {
				[execute, undo] = [addClass, removeClass];
			}
		}

		return new AtomicCommand({
			execute, undo
		});
	}

	toggleImport({href, forceAddRem}) {
		let events = this.events;
		let linkImport = this.linkImport;

		let addImport = function() {
			linkImport.addImport(href);
			events.emit('GUID.dom.import.add', {
				href
			});
		};
		let removeImport = function() {
			linkImport.removeImport(href);
			events.emit('GUID.dom.import.remove', {
				href
			});
		};

		let execute, undo;
		let exists = linkImport.exists(href);

		if (forceAddRem === true) { // add
			[execute, undo] = [addImport, removeImport];
		} else if (forceAddRem === false) { // remove
			[execute, undo] = [removeImport, addImport];
		} else if (forceAddRem === undefined) { //toggle
			if (exists) {
				[execute, undo] = [removeImport, addImport];
			} else {
				[execute, undo] = [addImport, removeImport];
			}
		}

		return new AtomicCommand({
			execute, undo
		});
	}

}

export default CommandFactory;
