import "babel-polyfill";
import gui from './src/gui';

gui.ready.then(function(){
	let pluginsmodule = gui.get("plugins");

	// NOTE: auto loading all plugins
	pluginsmodule.loadMultiple([
		"undoRedo",
		"save",
		"preview",
		"outline",
		"attributes",
		"viewPort",
		"styling"
	]);

	pluginsmodule.activate("undoRedo");
	pluginsmodule.activate("save");
	pluginsmodule.activate("preview");
	pluginsmodule.activate("outline");
	pluginsmodule.activate("attributes");
	pluginsmodule.activate("styling");
	pluginsmodule.activate("viewPort");

});
