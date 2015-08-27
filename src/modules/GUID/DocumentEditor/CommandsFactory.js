class Command {
	constructor(args) {
		this._execute = args.execute;
		this._undo = args.undo;

		//optional
		this._thisArg = args.thisArg;
		this._afterExecute = args.afterExecute;
		this._afterUndo = args.afterUndo;
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

	set afterExecute(afterExecute) {
		this._afterExecute = afterExecute;
	}
	set afterUndo(afterUndo) {
		this._afterUndo = afterUndo;
	}
}

class CommandFactory {
	constructor(args) {
		this.events = args.events;

	}

	appendElement(args) {
		let {
			parent, child
		} = args;
		let events = this.events;

		let execute = function() {
			parent.appendChild(child);
			events.emit('GUID.dom.append', {
				parent, child
			});

			return {
				parent, child
			};
		};
		let undo = function() {
			parent.removeChild(child);
			events.emit('GUID.dom.remove', {
				parent, child
			});

			return {
				parent, child
			};
		};

		return new Command({
			execute,
			undo
		});
	}

	removeElement(args) {
		let {
			element
		} = args;
		let events = this.events;

		let nextNode = element.nextSibling;
		let parent = element.parentElement;

		let execute = function() {
			parent.removeChild(element);
			events.emit('GUID.dom.remove', {
				parent, child: element
			});

			return {
				parent, child: element
			};
		};
		let undo = function() {
			parent.insertBefore(element, nextNode);
			events.emit('GUID.dom.append', {
				parent, child: element
			});

			return {
				parent, child: element
			};
		};

		return new Command({
			execute, undo
		});
	}

	changeAttribute(args) {
		let {
			element, attribute, value
		} = args;
		let oldValue = element.getAttribute(attribute);
		let events = this.events;

		let execute = function() {
			element.setAttribute(attribute, value);
			events.emit('GUID.element.attribute.change', {
				element, attribute, oldValue, value
			});
		};
		let undo = function() {
			if (oldValue) {
				element.setAttribute(attribute, oldValue);
				events.emit('GUID.element.attribute.change', {
					element, attribute, oldValue: value, value: oldValue
				});
			} else {
				element.removeAttribute(attribute);
				events.emit('GUID.element.attribute.remove', {
					element, attribute
				});
			}
		};

		return new Command({
			execute, undo
		});
	}

	toggleClass(args) {
		let {
			element, className, forceAdd
		} = args;
		let events = this.events;

		let classList = element.classList;
		let exists = classList.contains(className);

		let addClass = function() {
			classList.add(className);
			events.emit('GUID.element.class.add', element, className);
		};
		let removeClass = function() {
			classList.remove(className);
			events.emit('GUID.element.class.remove', element, className);
		};

		let execute, undo;

		if (forceAdd === true) {
			[execute, undo] = [addClass, removeClass];
		} else if (forceAdd === false) {
			[execute, undo] = [removeClass, addClass];
		} else if (forceAdd === undefined) {
			if (exists) {
				[execute, undo] = [removeClass, addClass];
			} else {
				[execute, undo] = [addClass, removeClass];
			}
		}

		return new Command({
			execute, undo
		});
	}

}

export default CommandFactory;
