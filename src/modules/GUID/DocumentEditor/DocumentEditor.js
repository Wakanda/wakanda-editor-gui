import LinkImport from './LinkImport';
import { Broker, TemporaryBroker } from './Broker';
import { CommandFactory, Command } from './CommandFactory.js';
import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';
import ScriptManager from './ScriptManager';
import StyleManager from './Styling/StyleManager';
import Bijection from './Bijection';
import { HttpClient } from "../../../../lib/aurelia-http-client";

// TODO: important: script management
// TODO: important: import management

const API_PORT = 3001;
const API_BASE = `http://${location.hostname}:${API_PORT}/`;

let helpers = {
	postResJson: function(req, args){
		let url = API_BASE + req;
		return staticVars.httpClient.post(url, args)
			.then(({response})=>{
				return JSON.parse(response);
			});
	},
	loadOnIframe: function({path, iframe}){	//returns the document on the iframe
		return new Promise((res, rej) => {
			iframe.onload = () => {
				let winret = iframe.contentWindow || iframe.contentDocument || window.WIN;
				let iframeDoc;
				if (winret.document) {
					iframeDoc = winret.document || window.DOCUMENT;
				}
				res({
					win: winret,
					doc: iframeDoc
				});
			};
			iframe.src = path;
		});
	},
	documentToHtmlString: function({document: doc}){
		return doc.documentElement.outerHTML;
	},
	domElementToString({elements}){
		let span = document.createElement('span');
		Array.prototype.forEach.call(elements, (element)=>{
			span.appendChild(element);
		})
		// span.appendChild(element);
		return span.innerHTML;
	}
}

let staticVars = {};

staticVars.hidenIframe = document.createElement('iframe');
staticVars.shownIframe = document.createElement('iframe');
staticVars.hidenIframe.classList.add('document-editor-iframe');
staticVars.shownIframe.classList.add('document-editor-iframe');
staticVars.hidenIframe.classList.add('source');
staticVars.shownIframe.classList.add('render');

staticVars.cloudEditorIDE = document.querySelector('#cloud-ide-editor');

staticVars.cloudEditorIDE.appendChild(staticVars.hidenIframe);
staticVars.cloudEditorIDE.appendChild(staticVars.shownIframe);

staticVars.httpClient = new HttpClient().configure(x => {
	x.withHeader('Content-Type', 'application/json');
});

staticVars.currentDocumentEditor = null;


class DocumentEditor {

	static get currentDocumentEditor(){
		return staticVars.currentDocumentEditor || null;
	}

	static async load({projectPath}){

		let sourceDocOb = await DocumentEditor.createDocumentSourceCode({projectPath});

		let sourceCode = helpers.documentToHtmlString({document: sourceDocOb.doc});

		let renderDocOb = await DocumentEditor.createDocumentRenderCode({
			sourceCode,
			scriptTags: sourceDocOb.headScripts,
			projectPath
		});

		staticVars.currentElement = new DocumentEditor({
			sourceDocument 	: sourceDocOb.doc,
			sourceWindow 		: sourceDocOb.win,
			renderDocument 	: renderDocOb.doc,
			renderWindow		: renderDocOb.win,
			scriptTags			:	sourceDocOb.headScripts,
			projectPath
		});


		return staticVars.currentElement;
	}

	static async createDocumentRenderCode( { sourceCode, scriptTags, projectPath: projectFile } ){

		let {renderUrl} = await helpers.postResJson('getRenderCode', {
			sourceCode, scriptTags, projectFile
		});
		return await helpers.loadOnIframe({
			path: renderUrl,
			iframe: staticVars.shownIframe
		});

	}

	static async createDocumentSourceCode({projectPath}){

		let {sourceUrl, headScripts} = await helpers.postResJson('getSourceCode', {
			projectFile: projectPath
		});

		let {win, doc} = await helpers.loadOnIframe({
			path: sourceUrl,
			iframe: staticVars.hidenIframe
		});

		return { win, doc, headScripts };

	}

	//TODO rev
	constructor({scriptTags, broker = new Broker(), sourceDocument, sourceWindow, renderDocument, renderWindow, projectPath}) {

		this._events = new MultiEvent();

		this._mainBroker = broker;
		this._temporaryBroker = new TemporaryBroker();

		this._renderDocument = renderDocument;
		this._sourceDocument = sourceDocument;

		this._renderWindow = renderWindow;
		this._sourceWindow = sourceWindow;

		this._scriptTags = scriptTags;
		this._projectPath = projectPath;
		// this._path = projectPath;

		//FIXME - Ugly fix to force html and body to fill iframe properly
		renderDocument.documentElement.style.height = '100%';
		renderDocument.body.style.margin = '0';

		this._selectedElement = null;

		this.styleManager = new StyleManager({
			document: this._renderDocument
		});

		// this.linkImport = new LinkImport({
		// 	document: iframeDoc
		// });

		// this.scriptManager = new ScriptManager({
		// 	document: iframeDoc
		// });
		this._initBijection();
		this._initEvents();
		this._initCommands();

	}
	// NOTE: important !
	async _initRenderCode(){
		this.rendering ++;

		let sourceCode = helpers.documentToHtmlString({
			document: this._sourceDocument
		});
		// FIXME: find better way to do it
		this._prenventAsync = ((this._prenventAsync || 0) + 1) % 5;

		let {win, doc} = await DocumentEditor.createDocumentRenderCode({
				sourceCode,
				scriptTags: this._scriptTags,
				projectPath: this.path + `_${this._prenventAsync}.html`
			});

		this._renderWindow = win;
		this._renderDocument = doc;

		this._initBijection();

		this._initRenderIframeEvents();

		this.rendering --;

		return true;
	}

	_initBijection(){
		this._bijection = new Bijection({
			sourceBody: this._sourceDocument.body,
			renderBody: this._renderDocument.body
		});
	}
	set rendering(rendering){
		// console.log(rendering);
		this._rendering = rendering;
	}

	get rendering(){
		return this._rendering || 0;
	}

	_initCommands() {
		this.commandFactory = new CommandFactory({
			broker: this._mainBroker,

			events: this._events,
			linkImport: this.linkImport,
			scriptManager: this.scriptManager,
			styleManager: this.styleManager
		});
	}

	_initEvents() {
		// GUID.document.resize
		window.onresize = (event) => {
			let {width, height} = this.dimensions

			this._events.emit('GUID.document.resize', {
				width, height, event
			});
		};

		this._initRenderIframeEvents();
	}

	_initRenderIframeEvents(){
		this._renderWindow.onscroll = () => {
			this._events.emit('GUID.document.scroll', this.dimensions);
		}
	}

	get path(){
		return this._projectPath;
	}

	get broker(){
		return this._mainBroker
	}

	get sourceDocument() {
		return this._sourceDocument;
	}

	get renderDocument(){
		return this._renderDocument;
	}

	get dimensions(){
		let WINSize = this._renderDocument.documentElement.getBoundingClientRect();
		let width = (this._renderDocument.documentElement.scrollHeight > this._renderDocument.documentElement.clientHeight) ? WINSize.width : this._renderWindow.innerWidth;
		let height = (this._renderDocument.documentElement.scrollWidth > this._renderDocument.documentElement.clientWidth) ? WINSize.height : this._renderWindow.innerHeight;

		return {height, width};
	}

	get selectedElement(){
		return this._selectedElement || null;
	}
	// NOTE: old scripts management
	get scripts(){
		return this.scriptManager.scripts;
	}

	get scriptTags(){
		return this._scriptTags;
	}

	get events(){
		return this._events;
	}

	get renderedPromise(){
		if(this._renderedPromise){
			return this._renderedPromise.then(()=>true);
		}
		else{
			return Promise.resolve(true);
		}
	}

	deselectElement() {
		if (this._selectedElement) {
			this._events.emit('GUID.dom.deselect' , {
				element: this._selectedElement
			});
			this._selectedElement = null;
		}
	}

	onElementDeselected(callBack) {
		this._events.on('GUID.dom.deselect', callBack);
	}

	changeDocumentSize({height:h, width:w, minWidth:mw}){
		if(w){
			//Fix for desktop width on responsiveSelector
			w = w === "100%" ? null : w;

			staticVars.cloudEditorIDE.style.width = w;
		}
		if(h){
			staticVars.cloudEditorIDE.style.height = h;
		}

		//Min width has to be removed if not passed to method as parameter
		staticVars.cloudEditorIDE.style['min-width'] = mw ? mw : null;

		let {height, width} = this.dimensions;

		this._events.emit('GUID.document.resize', {width, height});
	}

	onDocumentSizeChange(callBack) {
		this._events.on('GUID.document.resize', callBack);
	}

	onDocumentScroll(callBack) {
		this._events.on('GUID.document.scroll', callBack);
	}

	removeElement({element = this.selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.removeElement({element});
		command.afterExecute = ()=>{
			this.deselectElement();
		};
		return this.executeOrReturn({command, justReturnCommand});
	}

	onRemoveElement(callBack) {
		this._events.on('GUID.dom.element.remove', callBack);
	}

	moveBeforeElement({element, elementRef, justReturnCommand = false}) {
		let removeCommand = this.commandFactory.removeElement({ element	});
		let appendCommand = this.commandFactory.prependElement({
			element,
			elementRef
		});

		let finalCommand = this.commandFactory.regroupCommands({
			commands: [removeCommand, appendCommand]
		});

		return this.executeOrReturn({command: finalCommand, justReturnCommand});
	}

	moveAfterElement({element, elementRef, justReturnCommand = false}) {
		let nextSiblingNode = elementRef.nextSibling;
		if(nextSiblingNode === null){
			return this.moveInsideElement({
				element,
				elementRef
			})
		}else{
			return this.moveBeforeElement({
				element,
				elementRef: nextSiblingNode,
				justReturnCommand
			});
		}
	}

	moveInsideElement({element, elementRef, justReturnCommand = false}) {
		let removeCommand = this.commandFactory.removeElement({ element	});
		let appendCommand = this.commandFactory.appendElement({
			parent: elementRef,
			child: element
		});

		let finalCommand = this.commandFactory.regroupCommands({
			commands: [removeCommand, appendCommand]
		});

		return this.executeOrReturn({command: finalCommand, justReturnCommand});
	}

	prependElement({element, elementRef = this._selectedElement, justReturnCommand = false}) { // append element before selected element if elementRef is undefined
		let command = this.commandFactory.prependElement({
			element, elementRef
		});

		return this.executeOrReturn({command, justReturnCommand});
	}

	appendAfterElement({element, elementRef = this._selectedElement, justReturnCommand = false}) { // append element after selected element if elementRef is undefined
		let command;
		if(elementRef.nextSibling){
			command = this.commandFactory.prependElement({
				element,
				elementRef: elementRef.nextSibling
			});
		}else{
			command = this.commandFactory.appendElement({
				parent: elementRef.parentElement,
				child: element
			});
		}

		return this.executeOrReturn({command, justReturnCommand});
	}

	onAppendElement(callBack) {
		this._events.on('GUID.dom.element.append', callBack);
	}

	appendElement({element, parent = this._selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.appendElement({
			parent,
			child: element
		});
		command.afterUndo = ()=>{
			this.deselectElement();
		};

		return this.executeOrReturn({command, justReturnCommand});
	}

	getElementStyleAttribute({element, attribute}) {
		return this.styleManager.getInlineStyleAttribute({
			element,
			attribute
		});
	}

	getSelectedElementStyleAttribute({attribute}){
		return this.styleManager.getInlineStyleAttribute({
			element: this._selectedElement,
			attribute
		});
	}

	changeSelectedElementStyleAttribute({attribute, value, justReturnCommand = false}) {
		if (this._selectedElement) {
			let command = this.commandFactory.changeStyleAttribute({
				element: this._selectedElement,
				attribute,
				value
			});

			return this.executeOrReturn({command, justReturnCommand});
		}
	}

	onElementStyleAttributeChange(callBack) {
		this._events.on('GUID.dom.style.change', callBack);
	}

	//to remove attribute set value to null
	changeElementAttribute({element = this._selectedElement, attribute, value, justReturnCommand = false}) {
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

		return this.executeOrReturn({command, justReturnCommand});

	}
	changeElementAttributes({element = this._selectedElement, elements = [], attributes, values, justReturnCommand = false}){
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
		let finalCommand = this.commandFactory.regroupCommands({commands});

		return this.executeOrReturn({command: finalCommand, justReturnCommand});
	}

	onElementAttributeChange(callBack) {
		this._events.on('GUID.dom.element.changeAttribute', callBack);
	}

	onElementChange(callBack){
		this._events.on('GUID.dom.element.*', function({element, child, parent}){
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

	addRemoveClasses({classesToAdd, classesToRemove, element = this._selectedElement, justReturnCommand = false}){
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

		let command = this.commandFactory.regroupCommands({commands: [...removeCommands, ...addCommands]});

		return this.executeOrReturn({command, justReturnCommand});
	}

	toggleClass({className, element = this._selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.toggleClass({
			element,
			className
		});

		return this.executeOrReturn({command, justReturnCommand});

	}

	addClass({className, element = this._selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.toggleClass({
			element,
			className,
			forceAddRem: true
		});

		return this.executeOrReturn({command, justReturnCommand});
	}

	onElementClassadd(callBack) {
		this._events.on('GUID.dom.class.add', callBack);
	}

	removeClass({className, element = this._selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.toggleClass({
			element,
			className,
			forceAddRem: false
		});

		return this.executeOrReturn({command, justReturnCommand});
	}

	onElementClassRemove(callBack) {
		this._events.on('GUID.dom.class.remove', callBack);
	}

	onElementClassChange(callBack){
		this._events.on('GUID.dom.class.*', function({element, className}){
			let eventName = this.eventName; // GUID.dom.class.remove or GUID.dom.class.add
			let changeType = eventName.split('.').pop(); //		add/remove
			callBack({changeType, element, className});
		});
	}

	getElementFromPoint(coords) {
		if(this.rendering){
			return null;
		}else{
			let {	x, y } = coords;
			let renderElement = this._renderDocument.elementFromPoint(x, y);
			return this._bijection.getSourceFromRender({element: renderElement});
		}
	}

	getSelectedElementComputedStyle() {
		let selectedElementSource = this._selectedElement;
		if(selectedElementSource){
			return this._renderWindow.getComputedStyle(selectedElementSource);
		}else{
			console.warn('no selected element');
			return null;
		}
	}

	getselectedElementBoundingClientRect() {
		if(this._selectedElement){
			return this.getBoundingClientRect({element: this._selectedElement});
		}else{
			console.warn('no selected element');
			return null;
		}
	}

	getBoundingClientRect({element}){
		let renderElement = this._bijection.getRenderFromSource({element});
		return renderElement.getBoundingClientRect();
	}

	selectElement({element}) {
		if (element) {
			this._selectedElement = element;
			this._emitSelectElement();//after rendering
		}
	}

	_emitSelectElement(){
		this.renderedPromise
			.then(()=>{
				if(( ! this.rendering ) && this.selectedElement){
					this._events.emit('GUID.dom.select', {
						element: this.selectedElement
					});
				}
			});
	}

	onElementSelected(callBack) {
		this._events.on('GUID.dom.select', callBack);
	}

	selectElementByPoint(coords) {
		let element = this.getElementFromPoint(coords);
		this.selectElement({
			element
		});
	}

	selectParentOfSelected() {
		let parent = this._selectedElement.parentElement;
		if (parent) {
			this._selectedElement = parent;
			this._events.emit('GUID.dom.select', {
				element: parent
			});
		}
	}

	toggleImportHtml({href, justReturnCommand = false}){
		let command = this.commandFactory.toggleImport({
			href
		});

		return this.executeOrReturn({command, justReturnCommand});
	}

	addImportHtml({href, justReturnCommand = false}) {
		let command = this.commandFactory.toggleImport({
			href,
			forceAddRem: true
		});

		return this.executeOrReturn({command, justReturnCommand});
	}

	onAddImport(callBack) {
		this._events.on('GUID.dom.import.add', callBack);
	}

	removeImportHtml({href, justReturnCommand = false}) {
		let command = this.commandFactory.toggleImport({
			href,
			forceAddRem: false
		});

		return this.executeOrReturn({command, justReturnCommand});
	}

	onRemoveImport(callBack) {
		this._events.on('GUID.dom.import.remove', callBack);
	}

	// FIXME:
	getElementText({element = this._selectedElement}){
		let childNodes = element.childNodes;
		// NOTE: tested only on chrome
		if(childNodes.length === 1 && childNodes[0].nodeType ===3 ){
			return element.innerText;
		}else{
			return null;
		}
	}

	changeElementText({element = this._selectedElement, text, justReturnCommand = false}){
		let command = this.commandFactory.changeElementText({
			element,
			text
		});

		return this.executeOrReturn({command, justReturnCommand});
	}

	onElementTextChange(callBack){
		this._events.on('GUID.dom.element.changeText', callBack);
	}

	// TODO: review duplications
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

		let command = this.commandFactory.regroupCommands({commands: [...removeCommands, ...addCommands]});

		return this.executeOrReturn({command, justReturnCommand});
	}

	// NOTE: old script management
	addScript({script, justReturnCommand = false}) {
		let command = this.commandFactory.toggleScript({
			script,
			forceAddRem: true
		});

		return this.executeOrReturn({command, justReturnCommand});
	}

	onAddScript(callBack) {
		this._events.on('GUID.dom.script.add', callBack);
	}

	removeScript({script, justReturnCommand = false}) {
		let command = this.commandFactory.toggleScript({
			script,
			forceAddRem: false
		});

		return this.executeOrReturn({command, justReturnCommand});
	}

	onRemoveScript(callBack) {
		this._events.on('GUID.dom.script.remove', callBack);
	}

	onChangeScript(callBack){
		this._events.on('GUID.dom.script.*', function({script}){
			let eventName = this.eventName;
			let changeType = eventName.split('.').pop();
			callBack({changeType, script});
		});
	}

	executeOrReturn({command, justReturnCommand}){
		let renderingFunc = () => {
			this._renderedPromise = this.renderedPromise.then(()=>{
				return this._initRenderCode();
			});
			this._emitSelectElement();
		};
		command.afterExecute = command.afterUndo = renderingFunc;
		if(justReturnCommand){
			return command;
		}else{
			command.exec();
		}
	}

	async save(){
		return await this.saveAs({projectPath: this.path});
	}

	async saveAs({projectPath}){
		let sourceCode = this._sourceDocument.documentElement.outerHTML;
		let scriptTags = this._scriptTags;
		return await helpers.postResJson('saveProject',{
			sourceCode, scriptTags, projectFile: projectPath
		});
	}

	temporaryAppendElement({element, parent = this._selectedElement}){
		let command = this.commandFactory.appendElement({
			parent,
			child: element
		});
		command.afterUndo = ()=>{
			this.deselectElement();
		};
		this._temporaryBroker.exec({command});
	}

}

export default DocumentEditor;
