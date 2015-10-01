import LinkImport from './LinkImport';
import Broker from './Broker';
import commandsFactory from './commandsFactory.js';
import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';

//TODO !important loaded ///./../.

class DocumentEditor {

	//TODO rev
	constructor({broker = new Broker(), path}) {
		// let _EventEmitter = require('../../../../lib/micro-events.js');
		// this.events = new _EventEmitter();

		this.events = new MultiEvent();

		this.broker = broker;
		this.iframe = document.createElement('iframe');
		this.iframe.setAttribute('id', 'editor-playground');
		this.iframe.classList.add('document-editor-iframe');
		document.querySelector('.cloud-ide-editor').appendChild(this.iframe);

		console.log(path);
		this.documentPromise = this.loadIframe(path)
			.then((iframeDoc) => {
				this.document = iframeDoc;

				this.linkImport = new LinkImport({
					document: iframeDoc
				});

				this.selectedElement = iframeDoc.body || null;
				this.initEvents();
				this.initCommands();

				return iframeDoc;
			});

	}
	loadIframe(path) {
		return new Promise((res, rej) => {
			if (!path) {
				rej('invalid path');
			} else {
				this.iframe.onload = () => {
					this.window = this.iframe.contentWindow || this.iframe.contentDocument || window.WIN;
					let iframeDoc;
					if (this.window.document) {
						iframeDoc = this.window.document || window.DOCUMENT;
					}
					res(iframeDoc);
				}
				this.iframe.src = path;
			}
		});
	}

	deselectElement() {

		if (this.selectedElement) {
			this.events.emit('GUID.dom.deselect' , {
				element: this.selectedElement
			});
			this.selectedElement = null;
		}
	}

	onElementDeselected(callback) {
		this.events.on('GUID.dom.deselect', callback);
	}

	onReady(callBack) {
		this.documentPromise.then(() => {
			callBack(this);
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
		// GUID.window.resize
		window.onresize = (event) => {
			//TODO
			let WINSize = this.document.body.getBoundingClientRect();

			let width = (this.document.body.scrollHeight > this.document.body.clientHeight) ? WINSize.width : this.window.innerWidth;
			let height = (this.document.body.scrollWidth > this.document.body.clientWidth) ? WINSize.height : this.window.innerHeight;

			this.events.emit('GUID.window.resize', {
				width, height, event
			});
		};
	}
	onDocumentSizeChange(callBack) {
		this.events.on('GUID.window.resize', callBack);
	}

	removeElement({element}) {

		let command = this.commandsFactory.removeElement({element});

		let parent = this.selectedElement.parentElement;

		command.afterExecute = () => {
			if (this.selectedElement === element) {
				this.selectElement({
					element: parent
				});
			}
		};
		this.broker.createCommand(command)
			.executeNextCommand();

	}

	removeSelectedElement() {
		this.removeElement({
			element: this.selectedElement
		});
	}
	prependElement({element, elementRef = this.selectedElement}) { // append element before selected element if elementRef is undefined
		let command = this.commandsFactory.prependElement({
			element, elementRef
		});
		command.afterExecute = () => {
			this.selectElement({
				element
			});
		};
		command.afterUndo = () => {
			this.selectElement({
				element: elementRef
			});
		};

		this.broker.createCommand(command)
			.executeNextCommand();
	}

	appendToSelectedElement({element}) {
		let selElem = this.selectedElement;
		let events = this.events;

		let command = this.commandsFactory.appendElement({
			parent: selElem,
			child: element
		});

		command.afterUndo = ({parent}) => {
			this.selectElement({ element: parent });
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

	changeSelectedElementAttribute({attribute, value}) {
		let command = this.commandsFactory.changeAttribute({
			element: this.selectedElement,
			attribute,
			value
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onElementAttributeChange(callBack) {
		this.events.on('GUID.dom.attribute.change', callBack);
	}
	onElementAttributeRemove(callBack) {
		this.events.on('GUID.dom.attribute.remove', callBack);
	}

	toggleClassOfSelectedElement({className}) {
		let command = this.commandsFactory.toggleClass({
			element: this.selectedElement,
			className
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	addClassToSelectedElement({className}) {
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

	selectElement({element}) {
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

	toggleImportHtml({href}){
		let command = this.commandsFactory.toggleImport({
			href
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	addImportHtml({href}) {
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

	removeImportHtml({href}) {
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
