import LinkImport from './LinkImport';
import {Broker, TemporaryBroker} from './Broker';
import {CommandFactory, Command} from './CommandFactory.js';
import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';
import ScriptManager from './ScriptManager';
import StyleManager from './Styling/StyleManager';

//TODO !important loaded ///./../.

class DocumentEditor {

	//TODO rev
	constructor({broker = new Broker(), path}) {
		// let _EventEmitter = require('../../../../lib/micro-events.js');
		// this.events = new _EventEmitter();

		this.events = new MultiEvent();

		this.broker = broker;
		this.temporaryBroker = new TemporaryBroker();
		this.iframe = document.createElement('iframe');
		this.iframe.classList.add('document-editor-iframe');
		this.cloudEditorIDE = document.querySelector('#cloud-ide-editor');
		this.cloudEditorIDE.appendChild(this.iframe);

		console.log(path);
		this._path = path;
		this.documentPromise = this.loadIframe({path})
			.then((iframeDoc) => {
				this.document = iframeDoc;

				this.styleManager = new StyleManager({
					document: iframeDoc
				});

				this.linkImport = new LinkImport({
					document: iframeDoc
				});

				this.scriptManager = new ScriptManager({
					document: iframeDoc
				});

				this.selectedElement = /*iframeDoc.body || */ null;
				this.initEvents();
				this.initCommands();

				return iframeDoc;
			});
	}

	get path(){
		return this._path;
	}

	loadIframe({path}) {

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
				};
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

	onElementDeselected(callBack) {
		this.events.on('GUID.dom.deselect', callBack);
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
		this.commandFactory = new CommandFactory({
			events: this.events,
			linkImport: this.linkImport,
			scriptManager: this.scriptManager,
			styleManager: this.styleManager
		});
	}

	initEvents() {
		// GUID.document.resize
		window.onresize = (event) => {
			let {width, height} = this.dimensions

			this.events.emit('GUID.document.resize', {
				width, height, event
			});
		};
		this.window.onscroll = () => {
			this.events.emit('GUID.document.scroll', this.dimensions);
		}
	}
	changeDocumentSize({height:h, width:w, minWidth:mw}){
		if(w){
			//Fix for desktop width on responsiveSelector
			w = w === "100%" ? null : w;

			this.cloudEditorIDE.style.width = w;
		}
		if(h){
			this.cloudEditorIDE.style.height = h;
		}

		//Min width has to be removed if not passed to method as parameter
		this.cloudEditorIDE.style['min-width'] = mw ? mw : null;

		let {height, width} = this.dimensions;

		this.events.emit('GUID.document.resize', {width, height});
	}
	onDocumentSizeChange(callBack) {
		this.events.on('GUID.document.resize', callBack);
	}
	onDocumentScroll(callBack) {
		this.events.on('GUID.document.scroll', callBack);
	}
	get dimensions(){
		let WINSize = this.document.documentElement.getBoundingClientRect();
		let width = (this.document.documentElement.scrollHeight > this.document.documentElement.clientHeight) ? WINSize.width : this.window.innerWidth;
		let height = (this.document.documentElement.scrollWidth > this.document.documentElement.clientWidth) ? WINSize.height : this.window.innerHeight;

		return {height, width};
	}

	removeElement({element}) {

		let command = this.commandFactory.removeElement({element});

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
		let command = this.commandFactory.prependElement({
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

	temporaryAppendElement({element, parent = this.selectedElement}){
		let command = this.commandFactory.appendElement({
			parent,
			child: element
		});
		this.temporaryBroker.exec({command});
	}

	appendElement({element, parent = this.selectedElement}) {
		let command = this.commandFactory.appendElement({
			parent,
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
		this.events.on('GUID.dom.element.remove', callBack);
	}

	getSelectedElementStyleAttribute({attribute}){
		return this.styleManager.getInlineStyleAttribute({
			element: this.selectedElement,
			attribute
		});
	}

	changeSelectedElementStyleAttribute({attribute, value}) {
		if (this.selectedElement) {
			let command = this.commandFactory.changeStyleAttribute({
				element: this.selectedElement,
				attribute,
				value
			});
			this.broker.createCommand(command).executeNextCommand();
		}
	}

	onElementStyleAttributeChange(callBack) {
		this.events.on('GUID.dom.style.change', callBack);
	}

	//to remove attribute set value to null
	changeElementAttribute({element = this.selectedElement, attribute, value}) {
		if(attribute === 'class'){
			console.error('to chnage class attribute use class methods');
			return false;
		}
		if(attribute === 'style'){
			console.error('to change styles use style methods');
			return false;
		}
		let command = this.commandFactory.changeAttribute({
			element,
			attribute,
			value
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	changeElementAttributes({element = this.selectedElement, elements = [], attributes, values}){
		let len = attributes.length;
		if(len === 0 || len !== values.length || (elements && len !== elements.length)){
			console.error("somth' goew wrong here");
			return false;
		}
		let commands = [];
		for(let ii = 0; ii < len; ii++){
			let attribute = attributes[ii],
					value = values[ii],
					currentElement = elements[ii] || element;
			let command = this.commandFactory.changeAttribute({
				element: currentElement,
				attribute,
				value
			});
			commands.push(command);
		}
		let finalCommand = new Command({commands});
		this.broker.createCommand(finalCommand)
			.executeNextCommand();
	}
	onElementAttributeChange(callBack) {
		this.events.on('GUID.dom.element.changeAttribute', callBack);
	}
	onElementChange(callBack){
		this.events.on('GUID.dom.element.*', function({element, child, parent}){
			let eventName = this.eventName;
			let changeType = eventName.split('.').pop(); //		append, remove, changeText
			if(changeType === 'append' || changeType === 'remove'){
				element = child;
			}else{
				parent = element.parentElement;
			}
			callBack({changeType, element, parent});
		});
	}

	addRemoveClasses({classesToAdd, classesToRemove, element = this.selectedElement}){
		let addCommands = classesToAdd.map((classToadd)=>{
			return this.commandFactory.toggleClass({
				element,
				className: classToadd,
				forceAddRem: true
			});
		});

		let removeCommands = classesToRemove.map((classToRemove)=>{
			return this.commandFactory.toggleClass({
				element,
				className: classToRemove,
				forceAddRem: false
			});
		});

		let command = new Command({commands: [...removeCommands, ...addCommands]});
		this.broker.createCommand(command).executeNextCommand();
	}

	toggleClass({className, element = this.selectedElement}) {
		let command = this.commandFactory.toggleClass({
			element,
			className
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	addClass({className, element = this.selectedElement}) {
		let command = this.commandFactory.toggleClass({
			element,
			className,
			forceAddRem: true
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onElementClassadd(callBack) {
		this.events.on('GUID.dom.class.add', callBack);
	}
	removeClass({className, element = this.selectedElement}) {
		let command = this.commandFactory.toggleClass({
			element,
			className,
			forceAddRem: false
		});
		this.broker.createCommand(command)
				.executeNextCommand();
	}
	onElementClassRemove(callBack) {
		this.events.on('GUID.dom.class.remove', callBack);
	}
	onElementClassChange(callBack){
		this.events.on('GUID.dom.class.*', function({element, className}){
			let eventName = this.eventName; // GUID.dom.class.remove or GUID.dom.class.add
			let changeType = eventName.split('.').pop(); //		add/remove
			callBack({changeType, element, className});
		});
	}

	getElementFromPoint(coords) {
		let {
			x, y
		} = coords;
		return this.document.elementFromPoint(x, y);
	}
	getSelectedElementComputedStyle() {
		if(this.selectedElement){
			return this.window.getComputedStyle(this.selectedElement);
		}else{
			console.warn('no selected element');
			return null;
		}
	}
	getselectedElementBoundingClientRect() {
		if(this.selectedElement){
			return this.selectedElement.getBoundingClientRect();
		}else{
			console.warn('no selected element');
			return null;
		}
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
		let command = this.commandFactory.toggleImport({
			href
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	addImportHtml({href}) {
		let command = this.commandFactory.toggleImport({
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
		let command = this.commandFactory.toggleImport({
			href,
			forceAddRem: false
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onRemoveImport(callBack) {
		this.events.on('GUID.dom.import.remove', callBack);
	}

	changeSelectedElementText({text}){
		let command = this.commandFactory.changeElementText({
			element: this.selectedElement,
			text
		});
		this.broker.createCommand(command)
							 .executeNextCommand();
	}
	onElementTextChange(callBack){
		this.events.on('GUID.dom.element.changeText', callBack);
	}

	get scripts(){
		return this.scriptManager.scripts;
	}
	addRemoveScripts({scriptsToAdd, scriptsToRemove}){
		let removeCommands = scriptsToRemove.map((script)=>{
			return this.commandFactory.toggleScript({
				script,
				forceAddRem: false
			});
		});
		let addCommands = scriptsToAdd.map((script)=>{
			return this.commandFactory.toggleScript({
				script,
				forceAddRem: true
			});
		});

		let command = new Command({commands: [...removeCommands, ...addCommands]});
		this.broker.createCommand(command).executeNextCommand();
	}

	addScript({script}) {
		let command = this.commandFactory.toggleScript({
			script,
			forceAddRem: true
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onAddScript(callBack) {
		this.events.on('GUID.script.add', callBack);
	}

	removeScript({script}) {
		let command = this.commandFactory.toggleScript({
			script,
			forceAddRem: false
		});
		this.broker.createCommand(command)
			.executeNextCommand();
	}
	onRemoveScript(callBack) {
		this.events.on('GUID.script.remove', callBack);
	}

	onChangeScript(callBack){
		this.events.on('GUID.script.*', function({script}){
			let eventName = this.eventName;
			let changeType = eventName.split('.').pop();
			callBack({changeType, script});
		});
	}

	// TODO: improve me
	get htmlClone(){
		this.temporaryBroker.setToinitialState();
		let html = this.document.children[0];
		let cloneHtml = html.cloneNode(true);
		this.temporaryBroker.setToFinalState();

		return cloneHtml;
	}

}

export default DocumentEditor;
