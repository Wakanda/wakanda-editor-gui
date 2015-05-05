/*require("./style.css");

var IDE = window.IDE;

export default {
	
	save(){
		
		IDE.core.toolbar.removeClassToItem("save", "save-enabled");
		
		IDE.editor.setReadOnly(true);
		
		IDE.fileManager.setFile(IDE.qParams.path, IDE.editor.getContent()).then(function(){
			IDE.editor.dirty = false;
			IDE.editor.setReadOnly(false);
		});
	},
	
	on(event){
		switch(event.name){
			case "editor.ondirty":
				document.title = `(*) ${document.title}`;
				IDE.core.toolbar.addClassToItem("save", "save-enabled");
			break;
			
			case "editor.onclean":
				document.title = document.title.substr(4);
			break;
		}
	}
}
*/

require("./style.css");
import Core from "../../src/core2";

class Save {

	constructor(options) {
		this.subscribe = ["editor.ondirty","editor.onclean"];
		this.toolbar = [
			{
				name : "save",
				type : "button",
				action : "save"
			},
			{
				type : "separator"
			}
		]

		Core.plugins.Toolbar.addItems(this.toolbar);
		Core.plugins.Toolbar.render();

		
	}
	
	run() {
		Core.subscribePlugin("Save", this.subscribe);
	}

	save() {
		
		IDE.core.toolbar.removeClassToItem("save", "save-enabled");
		
		IDE.editor.setReadOnly(true);
		
		IDE.fileManager.setFile(IDE.qParams.path, IDE.editor.getContent()).then(function(){
			IDE.editor.dirty = false;
			IDE.editor.setReadOnly(false);
		});
	}
	
	on(event) {
		switch(event.name){
			case "editor.ondirty":
				document.title = `(*) ${document.title}`;
				IDE.core.toolbar.addClassToItem("save", "save-enabled");
			break;
			
			case "editor.onclean":
				document.title = document.title.substr(4);
			break;
		}
	}
}

export default Save

Core.register("Save", Save);