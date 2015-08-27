import LinkImport from './LinkImport';
import Broker from './Broker';
import commandsFactory from './commandsFactory.js';

class DocumentEditor {

	//TODO rev
	constructor(args) {
		let _EventEmitter = require('../../../../lib/micro-events.js');
		this.events = new _EventEmitter();

		this.broker = args.broker || new Broker();
		this.iframe = document.createElement('iframe');
		this.iframe.setAttribute('id', 'editor-playground');
		this.iframe.classList.add('document-editor-iframe');
		document.querySelector('.cloud-ide-editor').appendChild(this.iframe);
		let _this = this;


		let path = args.path;
		console.log(path);
		if (path) {
			_this.iframe.src = path;

			this.documentPromise = new Promise(function(res, rej) {
				_this.iframe.onload = function onIframeLoad(args) {
					_this.window = _this.iframe.contentWindow || _this.iframe.contentDocument || window.WIN;
					if (_this.window.document) {
						_this.document = _this.window.document || window.DOCUMENT;
					}

					_this.importedLinks = new LinkImport(_this.document);
					_this.selectedElement = _this.document.body || null;

					res(_this.document);

					_this.initEvents();
					_this.initCommands();
				}
			});
		}
	}

	initCommands() {
		this.commandsFactory = new commandsFactory({
			events: this.events
		});
	}

	initEvents() {
		let _this = this;

		// GUID.window.resize
		window.onresize = function(event) {
			//TODO
			let WINSize = _this.document.body.getBoundingClientRect();

			let width = (_this.document.body.scrollHeight > _this.document.body.clientHeight) ? WINSize.width : _this.window.innerWidth;
			let height = (_this.document.body.scrollWidth > _this.document.body.clientWidth) ? WINSize.height : _this.window.innerHeight;

			_this.events.emit('GUID.window.resize', {
				width, height, event
			});
		};
	}
	onDocumentSizeChange(callBack) {
		this.events.on('GUID.window.resize', callBack);
	}

	removeElement(args) {
		let {
			element
		} = args;

		let _this = this;

		let command = this.commandsFactory.removeElement({
			element
		});
		command.afterExecute = function() {
			if (_this.selectedElement === element) {
				_this.selectElement({
					element: parent
				});
			}
		};
		this.broker.createCommand(command)
			.executeNextCommand();
	}

	removeSelectedElement() {
		this.removeElement({
			element: _this.selectedElement
		});
	}

	appendToSelectedElement(element) {
		let _this = this;

		let selElem = this.selectedElement;
		let events = this.events;

		let command = this.commandsFactory.appendElement({
			parent: selElem,
			child: element
		});

		command.afterUndo = function(args) {
			let {
				parent
			} = args;
			_this.selectElement({
				element: parent
			});
		};

		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onAppendElement(callBack) {
		this.events.on('GUID.dom.append', callBack);
	}
	onRemoveElement(callBack) {
		this.events.on('GUID.dom.remove', callBack)
	}

	changeSelectedElementAttribute(attribute, value) {
		let command = this.commandsFactory.changeAttribute({
			element: this.selectedElement,
			attribute,
			value
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onElementAttributeChange(callBack) {
		this.events.on('GUID.element.attribute.change', callBack);
	}
	onElementAttributeRemove(callBack) {
		this.events.on('GUID.element.attribute.remove', callBack);
	}

	toggleClassOfSelectedElement(className) {
		let command = this.commandsFactory.toggleClass({
			element: this.selectedElement,
			className
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	addClassToSelectedElement(className) {
		let command = this.commandsFactory.toggleClass({
			element: this.selectedElement,
			className,
			forceAdd: true
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onElementClassadd(callBack) {
		this.events.on('GUID.element.class.add', callBack);
	}
	removeClassFromSelectedElement(className) {
		let command = this.commandsFactory.toggleClass({
			element: this.selectedElement,
			className,
			forceAdd: false
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onElementClassRemove(callBack) {
		this.events.on('GUID.element.class.remove', callBack);
	}

	getElementFromPoint(coords) {
		let {x, y} = coords;
		return this.document.elementFromPoint(x, y);
	}
	getSelectedElementComputedStyle() {
		return this.window.getComputedStyle(this.selectedElement);
	}
	getselectedElementBoundingClientRect() {
		return this.selectedElement.getBoundingClientRect();
	}

	selectElement(args) {
		let {
			element
		} = args;
		this.selectedElement = element;

		this.events.emit('GUID.dom.select', {
			element: this.selectedElement
		});
	}

	selectElementByPoint(coords) {
		let element = this.getElementFromPoint(coords);
		this.selectElement({
			element
		});
	}

	selectParentOfSelected() {
		let parent = this.selectedElement.parentElement;
		if (parent) {
			this.selectedElement = parent;
			this.events.emit('GUID.dom.select', {
				element: parent
			});
		}
	}

	onElementSelected(callBack) {
		this.events.on('GUID.dom.select', callBack);
	}

}


export default DocumentEditor;
