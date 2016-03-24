import "babel-polyfill";
import gui from './src/gui';

gui.ready.then(function(){
	let pluginsmodule = gui.get("plugins");

	// NOTE: auto loading all plugins
	pluginsmodule.loadMultiple([
		"toolbar_plugin",
		"outline",
		"attributes",
		"viewPort",
		"styling"
	]);

	pluginsmodule.activate("toolbar_plugin");
	pluginsmodule.activate("outline");
	pluginsmodule.activate("attributes");
	pluginsmodule.activate("styling");
	pluginsmodule.activate("viewPort");

});
