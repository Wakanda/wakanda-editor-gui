require("./style.css");

var IDE = window.IDE;

export default {
	
	activate(){
		IDE.editor.onDirty(this.onDirty);
		IDE.editor.onClean(this.onClean);
	},
	
	save(){
		
		IDE.toolbar.removeClassToItem("save", "save-enabled");
		
		IDE.editor.setReadOnly(true);
		
		IDE.fileManager.setFile(IDE.qParams.path, IDE.editor.getContent()).then(function(){
			IDE.editor.dirty = false;
			IDE.editor.setReadOnly(false);
		});
	},
	
	onDirty(){
		document.title = `(*) ${document.title}`;
		IDE.toolbar.addClassToItem("save", "save-enabled");
	},
	
	onClean(){
		document.title = document.title.substr(4);
	}
}