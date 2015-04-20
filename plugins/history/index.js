require("./style.css");

var IDE = window.IDE;

export default {
	redo(){
		IDE.editor.redo();
	},
	
	undo(){
		IDE.editor.undo();
	},
	
	on(event){
		var undoManager   = IDE.editor.editor.session.$undoManager;
		
		if(undoManager.hasUndo()){
			IDE.toolbar.swapItemClass("undo", "undo", "undo-enabled");		
		} else {
			IDE.toolbar.swapItemClass("undo", "undo-enabled", "undo");
		}
		if(undoManager.hasRedo()){
			IDE.toolbar.swapItemClass("redo", "redo", "redo-enabled");		
		} else {
			IDE.toolbar.swapItemClass("redo", "redo-enabled", "redo");	
		}
	}
}