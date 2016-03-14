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
	"panels",
	"GUID"
]);

IDE.Core.onReady(function(){
	IDE.plugins.onPluginsLoaded(function(){
		IDE.plugins.activate("toolbar_plugin");
		IDE.plugins.activate("outline");
		IDE.plugins.events.emit("all_activated");
	});

	IDE.plugins.loadMultiple([
		"toolbar_plugin",
		"outline"
	]);
});
