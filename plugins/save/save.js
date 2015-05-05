require("./style.css");
import Core from "../../src/core";

class Save {

	constructor(options) {

		console.log(this.subscribe, "1")
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
		Core.EventManager.on("editor.ondirty", this.on);
		Core.EventManager.on("editor.onclean", this.on);
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