import "babel-polyfill";
import gui from './src/gui';

// NOTE: ex: adding undoRedo state
let guiArgs = { filePath: location.hash.substring(2) };

gui.load({	GUID:  guiArgs })
	.then( ( ) => {
		let pluginsManager = gui.get("plugins");

		var pluginsList = [
			"undoRedo",
			"save",
			"preview",
			"outline",
			"attributes",
			"viewPort",
			"styling",
//			"angular",
			"components",
			"htmlComponents"
		];

		// NOTE: auto loading all plugins
		// NOTE: asynchrone
		pluginsManager.loadMultiple(pluginsList);

		pluginsList.forEach(function(pluginName){
			pluginsManager.activate(pluginName);
		});

		// NOTE: temp
		//pluginsManager.events.emit('all_activated');
		// pluginsManager.activate("angular");

	});
