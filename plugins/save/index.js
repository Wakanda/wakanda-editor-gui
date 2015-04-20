require("./style.css");

var IDE = window.IDE;

export default {
	
	save(){
		
		IDE.toolbar.removeClassToItem("save", "save-enabled");
		
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
				IDE.toolbar.addClassToItem("save", "save-enabled");
			break;
			
			case "editor.onclean":
				document.title = document.title.substr(4);
			break;
		}
	}
}