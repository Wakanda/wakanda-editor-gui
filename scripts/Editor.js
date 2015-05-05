import Core from "../src/core";

class Editor {	
	
	constructor({lib, id="editor", theme="monokai", mode="javascript", options={}}){
		this.lib     = lib;
		this.mode    = this.mode || mode;
		this.theme   = theme;
		this.options = options;		
		this._dirty  = false;
		this.init(id);
	}
	
	init(id) {
		
		this.editor = this.create(id);
		
		this.setTheme(this.theme);
		this.setMode(this.mode);
		this.setOptions(this.options);
		if (IDE.qParams.path){
			this.loadFile();
		} else {
			this.ready();
		}
	}
	
	registerEvents() {
		var document = this.document || this.editor.session.getDocument();
		
		document.on("change", (...args)=> {
			setTimeout(()=>this.dirty = true , 0);
			setTimeout(()=>Core.EventManager.emit("editor.onchange", {name : "editor.onchange", params : args}), 0);
		});
	}
	
	loadFile(){
		var path = IDE.qParams.path
		Core.get("fileManager").getFile(path).then((event)=>{
			var content = event.response;
			
			this.setContent(content);
			/*
			 * Ace Workaround
			 * {
			 */
			this.editor.session.setUndoManager(new (this.lib.UndoManager)());
			/*
			 * }
			 */
			 
			this.ready();			
		});
	}
	
	ready() {
		this.registerEvents();
		Core.EventManager.emit("editor.onready", {name : "editor.onready"});
	}
	
	create(id) {
		return this.lib.edit(id);
	}
	
	setContent(content) {
		this.editor.setValue(content, -1);
	}
	
	getContent() {
		return this.editor.getValue();
	}
	
	setReadOnly(value) {
		this.editor.setReadOnly(value)
	}
	
	setOptions(options) {
		this.editor.setOptions(options);
	}
	
	setTheme(theme) {
		this.editor.setTheme(`ace/theme/${theme}`);
	}
	
	setMode(mode) {
		this.editor.setOption("mode", `ace/mode/${mode}`);
	}
	
	undo() {
		this.editor.undo();
	}
	
	redo() {
		this.editor.redo();
	}
	
	set dirty(value){
		if(value && ! this._dirty){
			this._dirty = true;
			Core.EventManager.emit("editor.ondirty", {name : "editor.ondirty"});
		}else if(!value && this._dirty){
			this._dirty = false;
			Core.EventManager.emit("editor.onclean", {name : "editor.onclean"});
		}
	}
	
	get dirty(){
		return this._dirty;
	}
	
}

export default Editor;