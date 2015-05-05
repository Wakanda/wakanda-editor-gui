/*require("./style.css");

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
			IDE.core.toolbar.swapItemClass("undo", "undo", "undo-enabled");		
		} else {
			IDE.core.toolbar.swapItemClass("undo", "undo-enabled", "undo");
		}
		if(undoManager.hasRedo()){
			IDE.core.toolbar.swapItemClass("redo", "redo", "redo-enabled");		
		} else {
			IDE.core.toolbar.swapItemClass("redo", "redo-enabled", "redo");	
		}
	}
}*/

require("./style.css");
import Core from "../../src/core2";

class Histories {

	constructor(options) {

		this.subscribe = ["editor.onchange"];
		this.toolbar = [
			{
				name : "undo",
				type : "button",
				action : "undo"
			},
			{
				name : "redo",
				type : "button",
				action : "redo"
			},
			{
				type : "separator"
			}
		]

		Core.plugins.Toolbar.addItems(this.toolbar);
		Core.plugins.Toolbar.render();

		
	}
	
	run() {
		Core.subscribe("Histories", this.subscribe);
	}

	redo(){
		IDE.editor.redo();
	}
	
	undo(){
		IDE.editor.undo();
	}
	
	on(event){
		var undoManager   = IDE.editor.editor.session.$undoManager;
		
		if(undoManager.hasUndo()){
			IDE.core.toolbar.swapItemClass("undo", "undo", "undo-enabled");		
		} else {
			IDE.core.toolbar.swapItemClass("undo", "undo-enabled", "undo");
		}
		if(undoManager.hasRedo()){
			IDE.core.toolbar.swapItemClass("redo", "redo", "redo-enabled");		
		} else {
			IDE.core.toolbar.swapItemClass("redo", "redo-enabled", "redo");	
		}
	}
}

export default Histories



Core.register("Histories", Histories);