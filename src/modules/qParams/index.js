import {query, mapExtToEditorMode} from "../Utils"

var Module = {
	activate(loaded){
		//Core Plugin qParams
		var qParams    = query();
		var mode       = qParams.mode;
		IDE.qParams    = qParams;

		if(IDE.qParams.path){
			var extResult = IDE.qParams.path.match(/([^\/\.]+)\.?([^\.]+)$/);	
			if (extResult){
				IDE.filename   = extResult[0];
				if(!mode ){
					mode = mapExtToEditorMode(extResult[2].toLowerCase());
				}
				document.title = IDE.filename;
			}
		}
		
		loaded();
	}
}

export default Module;