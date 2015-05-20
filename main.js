var IDE = window.IDE = {};

//@temporary resolve.alias / unit-tests example - just access "aliasExample" object from console
import aliasExample from "./alias-example";
window.aliasExample = aliasExample;
//@end temporary

require("./styles/common.css");
require("./styles/editor.css");
require("./styles/tree.css");

import Core from "./src/core";

import Toolbar from "./plugins/toolbar/toolbar";
Toolbar.conf = {
	className : "page_toolbar",
	items : []
}
import Save from "./plugins/save/save";
import Histories from "./plugins/history/history";


/****** @to update ******/
import Editor from "./scripts/Editor";
import Tree from "./scripts/Tree"
import TabManager from "./scripts/TabManager"
import {query, mapExtToEditorMode} from "./scripts/Utils"

/*
 * Query Params ***** @to update ******
 */
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


/************/


import FileManager from "./plugins/fileManager/fileManager";

Core.run();


/****** @to update ******/
/*
 * Create Explorer
 */
var explorer    = new Tree({
	className : "cloud-ide-tree",
	path      : qParams.path,
	project   : qParams.project
});
IDE.explorer = explorer;

/*
 * Create Editor
 */
switch(mode){
	case "html":
		require.ensure(["./scripts/EditorHTML.js"], function(require){
			var Editor  = require("./scripts/EditorHTML.js");
			IDE.editor = new Editor({id:"editor", lib: ace});
		});
		break;
	case "javascript":
		require.ensure(["./scripts/EditorJS.js"], function(require){
			var Editor  = require("./scripts/EditorJS.js");
			IDE.editor = new Editor({id:"editor", lib: ace});
		});
		break;
	default:
		require.ensure(["./scripts/Editor.js"], function(require){
			var Editor  = require("./scripts/Editor.js");
			IDE.editor = new Editor({id:"editor", lib: ace, mode});
		});
}

/*
 * Create TabManager
 */
IDE.TabManager      = TabManager;
IDE.TabManager.tabs = {};

TabManager.connect(IDE.qParams.path);

TabManager.on('close', function(){
	TabManager.close();
	TabManager.connect();
});

TabManager.on('join', function(id) {
	IDE.TabManager.tabs[id] = true;
});

TabManager.on('leave', function(id){
	delete IDE.TabManager.tabs[id];
});