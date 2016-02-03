import "babel-polyfill";

var IDE = window.IDE = {};

require("./styles/common.css");
require("./styles/editor.css");
require("./styles/tree.css");
require("./styles/guid.css");

//- LOAD CORE -//
import Core from "./src/core";

//- INITIALIZE CORE -//
IDE.Core = new Core([
	"plugins",
	"toolbar",
	"GUID"
]);

IDE.Core.onReady(function(){
	IDE.plugins.onPluginsLoaded(function(){
		IDE.plugins.activate("GuidHistoryManager");
		IDE.plugins.activate("preview");
		IDE.plugins.events.emit("all_activated");
	});

	IDE.plugins.loadMultiple([
		"GuidHistoryManager",
		"preview"
	]);
});
