import LinkImport from './LinkImport';
import { Broker, TemporaryBroker } from './Broker';
import { CommandFactory, Command } from './CommandFactory.js';
import MultiEvent from '../../../../lib/multi-event-master/src/multi-event-es6.js';
import ScriptManager from './ScriptManager';
import StyleManager from './Styling/StyleManager';
import Bijection from './Bijection';
import { HttpClient } from "../../../../lib/aurelia-http-client";

let helpers = {
	postResJson: function(url, args){
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

// TODO: decalage tomorrow
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

let executeOrReturn = ({command, justReturnCommand})=>{
	if(justReturnCommand){
		return command;
	}else{
		command.exec();
	}
};

class DocumentEditor {

	// TODO: review
	static get currentDocumentEditor(){
		return staticVars.currentDocumentEditor || null;
	}

	static async load({projectPath}){

		let sourceDocOb = await DocumentEditor.createDocumentSourceCode({projectPath});

		let sourceCode = helpers.documentToHtmlString({document: sourceDocOb.doc});
		console.log(projectPath);
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
	// NOTE: important !
	async initRenderCode(){
		let sourceCode = helpers.documentToHtmlString({
			document: this._sourceDocument
		});

		let {win, doc} = await DocumentEditor.createDocumentRenderCode({
				sourceCode,
				scriptTags: this._scriptTags,
				projectPath: this._scriptTags
			});

		this._renderWindow = win;
		this._renderDocument = doc;

		this._initBijection();

		return true;
	}

	static async createDocumentRenderCode( { sourceCode, scriptTags, projectPath: projectFile } ){

		let {renderUrl} = await helpers.postResJson(`http://${location.hostname}:3001/getRenderCode`, {
			sourceCode, scriptTags, projectFile
		});
		console.log(renderUrl);
		return await helpers.loadOnIframe({
			path: renderUrl,
			iframe: staticVars.shownIframe
		});

	}


	// TODO: without "project/"
	static async createDocumentSourceCode({projectPath}){

		let {sourceUrl, headScripts} = await helpers.postResJson(`http://${location.hostname}:3001/getSourceCode`, {
			projectFile: projectPath
		});

		console.log('dsffsdf', sourceUrl);
		let {win, doc} = await helpers.loadOnIframe({
			path: sourceUrl,
			iframe: staticVars.hidenIframe
		});

		return { win, doc, headScripts };

	}

	//TODO rev
	constructor({scriptTags, broker = new Broker(), sourceDocument, sourceWindow, renderDocument, renderWindow, projectPath}) {

		console.log('source document', sourceDocument);
		console.log('render document', renderDocument);

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

		// TODO: load thos components
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

	_initBijection(){
		this._bijection = new Bijection({
			sourceBody: this._sourceDocument.body,
			renderBody: this._renderDocument.body
		});
	}

	// get path(){
	// 	return this._path;
	// }

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

	// onReady(callBack) {
	// 	this.documentPromise.then(() => {
	// 		callBack(this);
	// 	});
	// 	return this;
	// }

	get sourceDocument() {
		return this._sourceDocument;
	}

	get renderDocument(){
		return this._renderDocument;
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
		this._renderWindow.onscroll = () => {
			this._events.emit('GUID.document.scroll', this.dimensions);
		}
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
	get dimensions(){
		let WINSize = this._renderDocument.documentElement.getBoundingClientRect();
		let width = (this._renderDocument.documentElement.scrollHeight > this._renderDocument.documentElement.clientHeight) ? WINSize.width : this._renderWindow.innerWidth;
		let height = (this._renderDocument.documentElement.scrollWidth > this._renderDocument.documentElement.clientWidth) ? WINSize.height : this._renderWindow.innerHeight;

		return {height, width};
	}

	removeElement({element, justReturnCommand = false}) {
		let command = this.commandFactory.removeElement({element});
		let parent = element.parentElement;

		return executeOrReturn({command, justReturnCommand});
	}

	removeSelectedElement(justReturnCommand = false) {
		this.removeElement({
			element: this._selectedElement
		});
	}

	get selectedElement(){
		return this._selectedElement || null;
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

		return executeOrReturn({command: finalCommand, justReturnCommand});
	}

	moveAfterElement({element, elementRef, justReturnCommand = false}) {
		let nextSiblingNode = elementRef.nextSibling;

		return this.moveBeforeElement({
			element,
			elementRef: nextSiblingNode,
			justReturnCommand
		});
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

		return executeOrReturn({command: finalCommand, justReturnCommand});
	}

	prependElement({element, elementRef = this._selectedElement, justReturnCommand = false}) { // append element before selected element if elementRef is undefined
		let command = this.commandFactory.prependElement({
			element, elementRef
		});

		return executeOrReturn({command, justReturnCommand});
	}

	appendAfterElement({element, elementRef = this._selectedElement, justReturnCommand = false}) { // append element after selected element if elementRef is undefined
		let command = this.commandFactory.prependElement({
			element,
			elementRef: elementRef.nextSibling
		});

		return executeOrReturn({command, justReturnCommand});
	}

	temporaryAppendElement({element, parent = this._selectedElement}){
		let command = this.commandFactory.appendElement({
			parent,
			child: element
		});
		this._temporaryBroker.exec({command});
	}

	appendElement({element, parent = this._selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.appendElement({
			parent,
			child: element
		});

		return executeOrReturn({command, justReturnCommand});
	}

	onAppendElement(callBack) {
		this._events.on('GUID.dom.element.append', callBack);
	}

	onRemoveElement(callBack) {
		this._events.on('GUID.dom.element.remove', callBack);
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

			return executeOrReturn({command, justReturnCommand});
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

		return executeOrReturn({command, justReturnCommand});

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

		return executeOrReturn({command: finalCommand, justReturnCommand});
	}
	onElementAttributeChange(callBack) {
		this._events.on('GUID.dom.element.changeAttribute', callBack);
	}
	onElementChange(callBack){
		// TODO: subscribe here to refresh render page tomorrow
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

		return executeOrReturn({command, justReturnCommand});
	}

	toggleClass({className, element = this._selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.toggleClass({
			element,
			className
		});

		return executeOrReturn({command, justReturnCommand});

	}
	addClass({className, element = this._selectedElement, justReturnCommand = false}) {
		let command = this.commandFactory.toggleClass({
			element,
			className,
			forceAddRem: true
		});

		return executeOrReturn({command, justReturnCommand});

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

		return executeOrReturn({command, justReturnCommand});

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
		let {
			x, y
		} = coords;
		let renderElement = this._renderDocument.elementFromPoint(x, y);
		return this._bijection.getSourceFromRender({element: renderElement});
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
	// TODO: change name of _selectedElement
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

			this._events.emit('GUID.dom.select', {
				element: this._selectedElement
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
		let parent = this._selectedElement.parentElement;
		if (parent) {
			this._selectedElement = parent;
			this._events.emit('GUID.dom.select', {
				element: parent
			});
		}
	}

	onElementSelected(callBack) {
		this._events.on('GUID.dom.select', callBack);
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
		this._events.on('GUID.dom.import.add', callBack);
	}

	removeImportHtml({href, justReturnCommand = false}) {
		let command = this.commandFactory.toggleImport({
			href,
			forceAddRem: false
		});

		return executeOrReturn({command, justReturnCommand});

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

		return executeOrReturn({command, justReturnCommand});
	}
	onElementTextChange(callBack){
		this._events.on('GUID.dom.element.changeText', callBack);
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

		let command = this.commandFactory.regroupCommands({commands: [...removeCommands, ...addCommands]});

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
		this._events.on('GUID.script.add', callBack);
	}

	removeScript({script, justReturnCommand = false}) {
		let command = this.commandFactory.toggleScript({
			script,
			forceAddRem: false
		});

		return executeOrReturn({command, justReturnCommand});

	}
	onRemoveScript(callBack) {
		this._events.on('GUID.script.remove', callBack);
	}

	onChangeScript(callBack){
		this._events.on('GUID.script.*', function({script}){
			let eventName = this.eventName;
			let changeType = eventName.split('.').pop();
			callBack({changeType, script});
		});
	}

	// TODO: improve me
	get htmlClone(){
		this._temporaryBroker.setToinitialState();
		let html = this._sourceDocument.children[0];
		let cloneHtml = html.cloneNode(true);
		this._temporaryBroker.setToFinalState();

		return cloneHtml;
	}

	// TODO: remove me please
	get events(){
		return this._events;
	}

}

export default DocumentEditor;
