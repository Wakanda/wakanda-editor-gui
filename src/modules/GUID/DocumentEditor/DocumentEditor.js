import LinkImport from './LinkImport';
import {Broker, TemporaryBroker} from './Broker';
import {CommandFactory, Command} from './CommandFactory.js';
import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';
import ScriptManager from './ScriptManager';
import StyleManager from './Styling/StyleManager';

let executeOrReturn = ({command, justReturnCommand})=>{
	if(justReturnCommand){
		return command;
	}else{
		command.exec();
	}
};

//TODO !important loaded ///./../.

class DocumentEditor {

	//TODO rev
	constructor({broker = new Broker(), path}) {
		// let _EventEmitter = require('../../../../lib/micro-events.js');
		// this.events = new _EventEmitter();

		this.events = new MultiEvent();

		this.mainBroker = broker;
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

				//FIXME - Ugly fix to force html and body to fill iframe properly
				this.document.documentElement.style.height = '100%';
				this.document.body.style.margin = '0';

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
			broker: this.mainBroker,

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

	removeElement({element, justReturnCommand = false}) {
		let command = this.commandFactory.removeElement({element});
		let parent = element.parentElement;

		return executeOrReturn({command, justReturnCommand});
	}

	removeSelectedElement(justReturnCommand = false) {
		this.removeElement({
			element: this.selectedElement
		});
	}


	moveBeforeElement({element, elementRef, justReturnCommand = false}) {
		let command = this.commandFactory.moveBeforeElement({element, elementRef});

		return executeOrReturn({command, justReturnCommand});
	}

	moveAfterElement({element, elementRef, justReturnCommand = false}) {
		let command = this.commandFactory.moveAfterElement({element, elementRef});
		return executeOrReturn({command, justReturnCommand});
	}

	moveInsideElement({element, elementRef, justReturnCommand = false}) {
		let command = this.commandFactory.moveInsideElement({element, elementRef});

		return executeOrReturn({command, justReturnCommand});
	}

	prependElement({element, elementRef = this.selectedElement, justReturnCommand = false}) { // append element before selected element if elementRef is undefined
		let command = this.commandFactory.prependElement({
			element, elementRef
		});

		return executeOrReturn({command, justReturnCommand});
	}

	appendAfterElement({element, elementRef = this.selectedElement, justReturnCommand = false}) { // append element after selected element if elementRef is undefined
		let command = this.commandFactory.appendAfterElement({
			element, elementRef
		});

		return executeOrReturn({command, justReturnCommand});
	}

	temporaryAppendElement({element, parent = this.selectedElement}){
		let command = this.commandFactory.appendElement({
			parent,
			child: element
		});
		this.temporaryBroker.exec({command});
	}

	appendElement({element, parent = this.selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.appendElement({
			parent,
			child: element
		});

		return executeOrReturn({command, justReturnCommand});

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

	changeSelectedElementStyleAttribute({attribute, value, justReturnCommand = false}) {
		if (this.selectedElement) {
			let command = this.commandFactory.changeStyleAttribute({
				element: this.selectedElement,
				attribute,
				value
			});

			return executeOrReturn({command, justReturnCommand});
		}
	}

	onElementStyleAttributeChange(callBack) {
		this.events.on('GUID.dom.style.change', callBack);
	}

	//to remove attribute set value to null
	changeElementAttribute({element = this.selectedElement, attribute, value, justReturnCommand = false}) {
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

		return executeOrReturn({command, justReturnCommand});

	}
	changeElementAttributes({element = this.selectedElement, elements = [], attributes, values, justReturnCommand = false}){
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

		return executeOrReturn({command: finalCommand, justReturnCommand});
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

	addRemoveClasses({classesToAdd, classesToRemove, element = this.selectedElement, justReturnCommand = false}){
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

		return executeOrReturn({command, justReturnCommand});

	}

	toggleClass({className, element = this.selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.toggleClass({
			element,
			className
		});

		return executeOrReturn({command, justReturnCommand});

	}
	addClass({className, element = this.selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.toggleClass({
			element,
			className,
			forceAddRem: true
		});

		return executeOrReturn({command, justReturnCommand});

	}
	onElementClassadd(callBack) {
		this.events.on('GUID.dom.class.add', callBack);
	}
	removeClass({className, element = this.selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.toggleClass({
			element,
			className,
			forceAddRem: false
		});

		return executeOrReturn({command, justReturnCommand});

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
		if (element) {
			this.selectedElement = element;

			this.events.emit('GUID.dom.select', {
				element: this.selectedElement
			});
		}
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

	toggleImportHtml({href, justReturnCommand = false}){
		let command = this.commandFactory.toggleImport({
			href
		});

		return executeOrReturn({command, justReturnCommand});

	}
	addImportHtml({href, justReturnCommand = false}) {
		let command = this.commandFactory.toggleImport({
			href,
			forceAddRem: true
		});

		return executeOrReturn({command, justReturnCommand});

	}
	onAddImport(callBack) {
		this.events.on('GUID.dom.import.add', callBack);
	}

	removeImportHtml({href, justReturnCommand = false}) {
		let command = this.commandFactory.toggleImport({
			href,
			forceAddRem: false
		});

		return executeOrReturn({command, justReturnCommand});

	}
	onRemoveImport(callBack) {
		this.events.on('GUID.dom.import.remove', callBack);
	}

	changeSelectedElementText({text, justReturnCommand = false}){
		let command = this.commandFactory.changeElementText({
			element: this.selectedElement,
			text
		});

		return executeOrReturn({command, justReturnCommand});
	}
	onElementTextChange(callBack){
		this.events.on('GUID.dom.element.changeText', callBack);
	}

	get scripts(){
		return this.scriptManager.scripts;
	}
	addRemoveScripts({scriptsToAdd, scriptsToRemove, justReturnCommand = false}){
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

		return executeOrReturn({command, justReturnCommand});

	}

	addScript({script, justReturnCommand = false}) {
		let command = this.commandFactory.toggleScript({
			script,
			forceAddRem: true
		});

		return executeOrReturn({command, justReturnCommand});

	}
	onAddScript(callBack) {
		this.events.on('GUID.script.add', callBack);
	}

	removeScript({script, justReturnCommand = false}) {
		let command = this.commandFactory.toggleScript({
			script,
			forceAddRem: false
		});

		return executeOrReturn({command, justReturnCommand});

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
