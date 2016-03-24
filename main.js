import "babel-polyfill";
import gui from './src/gui';

gui.ready.then(function(){
	let pluginsManager = gui.get("plugins");

	// NOTE: auto loading all plugins
	pluginsManager.loadMultiple([
		"undoRedo",
		"save",
		"preview",
		"outline",
		"attributes",
		"viewPort",
		"styling",
		"angular"
	]);

	pluginsManager.activate("undoRedo");
	pluginsManager.activate("save");
	pluginsManager.activate("preview");
	pluginsManager.activate("outline");
	pluginsManager.activate("attributes");
	pluginsManager.activate("styling");
	pluginsManager.activate("viewPort");

	// NOTE: temp
	pluginsManager.events.emit('all_activated')
	// pluginsManager.activate("angular");

});
