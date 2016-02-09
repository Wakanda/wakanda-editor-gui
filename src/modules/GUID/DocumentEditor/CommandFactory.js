import Broker from './Broker';

class Command {
	constructor({commands, afterExecute, afterUndo, thisArg, broker}) {
		this._commands = commands;
		this._broker = broker;

		//optional
		this._thisArg = thisArg;
		this._afterExecute = afterExecute;
		this._afterUndo = afterUndo;
	}

	get broker(){
		return this._broker;
	}
	// execute via broker
	exec(){
		this._broker.createCommand(this)
			.executeNextCommand();
	}

	execute() {
		for(let command of this._commands) {
			command.execute();
		}
		if (this._afterExecute) {
			this._afterExecute.call(this._thisArg);
		}
	}

	undo() {
		for(let i = this._commands.length-1; i >= 0; i--){
			let command = this._commands[i];
			command.undo();
		}
		if (this._afterUndo) {
			this._afterUndo.call(this._thisArg);
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
	constructor({execute, undo, thisArg, afterExecute, afterUndo, broker}) {
		super({commands: [], afterExecute, afterUndo, thisArg, broker});

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

	// NOTE: this method retruns a new command that contains 'this' and the command (this) is not changed
	appendCommand({command}){
		return new Command({
			commands : [this, command]
		});
	}

	// NOTE: this method retruns a new command that contains 'this' and the commands (this) is not changed
	appendCommands({commands}){
		return new Command({
			commands : [this, ...commands]
		});
	}
}

class CommandFactory {
	constructor({events, linkImport, scriptManager, styleManager, broker = new Broker()}) {
		this.broker = broker;

		this.events = events;
		this.linkImport = linkImport;
		this.scriptManager = scriptManager;
		this.styleManager = styleManager;
	}

	prependElement({element, elementRef}) {
		let parent = elementRef.parentElement;

		let execute = () => {
			parent.insertBefore(element, elementRef);
			this.events.emit('GUID.dom.element.append', {
				parent,
				child: element,
				elementRef
			});
		};
		let undo = () => {
			parent.removeChild(element);
			this.events.emit('GUID.dom.element.remove', {
				parent, child: element
			});
		};

		return new AtomicCommand({
			broker: this.broker,
			execute, undo
		});
	}

	// FIXME:
	changeElementText({text, element}){

		let childNodes = element.childNodes;
		let command;
		if(childNodes.length > 1){
			console.error('not yet implemented, the command returned will be null');
			command = null;
		}else{
			let execute, undo;

			if (childNodes.length === 0) {
			 let oldVal = element.innerText;
			 execute = ()=>{
				 element.innerText = text;
				 this.events.emit('GUID.dom.element.changeText', {
					 element, text
				 });
			 };
			 undo = ()=>{
				 element.innerText = oldVal;
				 this.events.emit('GUID.dom.element.changeText', {
					 element, text: oldVal
				 });
			 }
		 }else /*if (childNodes.length === 1)*/ {
			 let oldVal = childNodes[0].nodeValue;
			 execute = ()=>{
				 element.innerText = text;
				 this.events.emit('GUID.dom.element.changeText', {
					 element, text
				 });
			 };
			 undo = ()=>{
				 childNodes[0].nodeValue = oldVal;
				 this.events.emit('GUID.dom.element.changeText', {
					 element, text: oldVal
				 });
			 }
		 }

		 command = new AtomicCommand({ execute, undo, broker: this.broker});
		}

		return command; //it can be null if the element contains other elements
	}

	appendElement({parent, child}) {

		let execute = () => {
			parent.appendChild(child);
			this.events.emit('GUID.dom.element.append', {
				parent,
				child,
				elementRef: null
			});

			return {
				parent, child
			};
		};
		let undo = () => {
			parent.removeChild(child);
			this.events.emit('GUID.dom.element.remove', {
				parent, child
			});

			return {
				parent, child
			};
		};

		return new AtomicCommand({
			broker: this.broker,
			execute, undo
		});
	}

	removeElement({element}) {

		let nextNode = element.nextSibling;
		let parent = element.parentElement;

		let execute = () => {
			if (parent) {
				parent.removeChild(element);
				this.events.emit('GUID.dom.element.remove', {
					parent, child: element
				});
			}

			return {
				parent, child: element
			};
		};
		let undo = () => {
			if (parent) {
				parent.insertBefore(element, nextNode);
				this.events.emit('GUID.dom.element.append', {
					parent,
					child: element,
					elementRef: nextNode
				});
			}

			return {
				parent, child: element
			};
		};

		return new AtomicCommand({
			broker: this.broker,
			execute, undo
		});
	}

	changeStyleAttribute({element, attribute, value}) {
		let oldValue = this.styleManager.getInlineStyleAttribute({element, attribute});

		let execute = () => {
			this.styleManager.changeInlineStyleAttribute({
				element,
				attributeName: attribute,
				value
			})
			this.events.emit('GUID.dom.style.change', {
				element, attribute, oldValue, value
			});
		};

		let undo = () => {
			this.styleManager.changeInlineStyleAttribute({
				element,
				attributeName: attribute,
				value: oldValue
			});
			this.events.emit('GUID.dom.style.change', {
				element, attribute, oldValue: value, value: oldValue
			});
		};

		return new AtomicCommand({ execute, undo, broker: this.broker});
	}

	changeAttribute({element, attribute, value}) {
		let oldValue = element.getAttribute(attribute);

		let changeValue = ({element, attribute, value}) => {
			let oldValue = element.getAttribute(attribute);
			let changeIt = value !== null;
			let removeIt = (value === null) && (oldValue !== null);
			if(changeIt){
				element.setAttribute(attribute, value);
			}else if(removeIt){
				element.removeAttribute(attribute);
			}
			if(changeIt || removeIt){
				this.events.emit('GUID.dom.element.changeAttribute', {
					element, attribute, oldValue, value
				});
			}
		};

		let execute = () => {
			changeValue({element, attribute, value});
		};
		let undo = () => {
			changeValue({element, attribute, value: oldValue});
		};

		return new AtomicCommand({
			broker: this.broker,
			execute, undo
		});
	}

	toggleClass({ element, className, forceAddRem }) {

		let classList = element.classList;
		let exists = classList.contains(className);
		// FIXME:
		let esm = this.styleManager.getElementStyleManager({element});

		let addClass = () => {
			esm.addClass({className});
			this.events.emit('GUID.dom.class.add', {
				element, className
			});
		};
		let removeClass = () => {
			esm.removeClass({className});
			this.events.emit('GUID.dom.class.remove', {
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
			broker: this.broker,
			execute, undo
		});
	}

	toggleScript({script, forceAddRem}){
				let scriptManager = this.scriptManager;

		let addScript = ()=>{
			let ok = scriptManager.addScript({script});
			if(ok){
				this.events.emit('GUID.script.add', { script });
			}
		};
		let removeScript = ()=>{
			let ok = scriptManager.removeScript({script});
			if(ok){
				this.events.emit('GUID.script.remove', { script });
			}
		};

		let execute, undo;

		if (forceAddRem === true) { // add
			[execute, undo] = [addScript, removeScript];
		} else if (forceAddRem === false) { // remove
			[execute, undo] = [removeScript, addScript];
		} else if (forceAddRem === undefined) { //toggle
			if (exists) {
				[execute, undo] = [removeScript, addScript];
			} else {
				[execute, undo] = [addScript, removeScript];
			}
		}

		return new AtomicCommand({
			broker: this.broker,
			execute, undo
		});
	}

	toggleImport({href, forceAddRem}) {
				let linkImport = this.linkImport;

		let addImport = ()=>{
			linkImport.addImport(href);
			this.events.emit('GUID.dom.import.add', {
				href
			});
		};
		let removeImport = ()=>{
			linkImport.removeImport(href);
			this.events.emit('GUID.dom.import.remove', {
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
			broker: this.broker,
			execute, undo
		});
	}

	regroupCommands({commands}){
		return new Command({
			commands,
			broker: this.broker
		});
	}
}

export {CommandFactory, Command};
