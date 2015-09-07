import LinkImport from './LinkImport';
import Broker from './Broker';
import commandsFactory from './commandsFactory.js';
import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';

//TODO !important loaded ///./../.

class DocumentEditor {

	//TODO rev
	constructor(args) {
		// let _EventEmitter = require('../../../../lib/micro-events.js');
		// this.events = new _EventEmitter();

		this.events = new MultiEvent();

		this.broker = args.broker || new Broker();
		this.iframe = document.createElement('iframe');
		this.iframe.setAttribute('id', 'editor-playground');
		this.iframe.classList.add('document-editor-iframe');
		document.querySelector('.cloud-ide-editor').appendChild(this.iframe);

		let _this = this;

		let path = args.path;
		console.log(path);
		this.documentPromise = this.loadIframe(path)
			.then((iframeDoc) => {
				_this.document = iframeDoc;
				_this.linkImport = new LinkImport({
					document: iframeDoc
				});
				_this.selectedElement = iframeDoc.body || null;
				_this.initEvents();
				_this.initCommands();

				return iframeDoc;
			});

	}
	loadIframe(path) {
		let _this = this;
		return new Promise((res, rej) => {
			if (!path) {
				rej('invalid path');
			} else {
				_this.iframe.onload = function onIframeLoad(args) {
					_this.window = _this.iframe.contentWindow || _this.iframe.contentDocument || window.WIN;
					let iframeDoc;
					if (_this.window.document) {
						iframeDoc = _this.window.document || window.DOCUMENT;
					}
					res(iframeDoc);
				}
				_this.iframe.src = path;
			}
		});
	}

	onReady(callBack) {
		let _this = this;
		this.documentPromise.then(function() {
			callBack(_this);
		});
		return this;
	}

	get document() {
		if (this._document) {
			return this._document;
		} else {
			throw "trying to access to ducument before loading done";
		}
	}
	set document(doc) {
		if (this._document) {
			throw "you've alrady set the attribute document";
		} else {
			this._document = doc;
		}
	}

	initCommands() {
		this.commandsFactory = new commandsFactory({
			events: this.events,
			linkImport: this.linkImport
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
		let parent = _this.selectedElement.parentElement;
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
	prependElement(args) { // append element before selected element if elementRef is undefined
		let {
			element
		} = args;
		let elementRef = args.elementRef || this.selectedElement;
		let _this = this;
		let command = this.commandsFactory.prependElement({
			element, elementRef
		});
		command.afterExecute = function() {
			_this.selectElement({
				element
			});
		};
		command.afterUndo = function() {
			_this.selectElement({
				element: elementRef
			});
		};

		this.broker.createCommand(command)
			.executeNextCommand();
	}

	appendToSelectedElement(args) {
		let _this = this;

		let {element} = args

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
		this.events.on('GUID.dom.element.append', callBack);
	}
	onRemoveElement(callBack) {
		this.events.on('GUID.dom.element.remove', callBack)
	}

	changeSelectedElementAttribute(args) {
		let {attribute, value} = args;
		let command = this.commandsFactory.changeAttribute({
			element: this.selectedElement,
			attribute,
			value
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onElementAttributeChange(callBack) {
		this.events.on('GUID.dom.changeAttribute', callBack);
	}
	onElementAttributeRemove(callBack) {
		this.events.on('GUID.dom.removeAttribute', callBack);
	}


	toggleClassOfSelectedElement(args) {
		let {className} = args;
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
			forceAddRem: true
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onElementClassadd(callBack) {
		this.events.on('GUID.dom.class.add', callBack);
	}
	removeClassFromSelectedElement(className) {
		let command = this.commandsFactory.toggleClass({
			element: this.selectedElement,
			className,
			forceAddRem: false
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onElementClassRemove(callBack) {
		this.events.on('GUID.dom.class.remove', callBack);
	}

	getElementFromPoint(coords) {
		let {
			x, y
		} = coords;
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

	addImportHtml(args) {
		let {href} = args;
		let command = this.commandsFactory.toggleImport({
			href,
			forceAddRem: true
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onAddImport(callBack) {
		this.events.on('GUID.dom.import.add', callBack);
	}

	removeImportHtml(args) {
		let {href} = args;
		let command = this.commandsFactory.toggleImport({
			href,
			forceAddRem: false
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onRemoveImport(callBack) {
		this.events.on('GUID.dom.import.remove', callBack);
	}

}


export default DocumentEditor;
