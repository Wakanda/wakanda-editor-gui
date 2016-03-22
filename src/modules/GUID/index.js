var Module = {
	activate(loaded) {
		//Core Plugin Editor
		IDE.GUID = {};

		require.ensure([
			"./DocumentEditor",
			"./UserInterface",
			"./Pannels/Components",
			"./Pannels/Angular"
		], function(require) {
			var DocumentEditor = require("./DocumentEditor");
			var UserInterface = require("./UserInterface");
			var Components = require("./Pannels/Components");
			var Angular = require("./Pannels/Angular");


			//TODO - URL of the iframe content
			let projectPath = location.hash.substring(2);

			console.log(projectPath);
			DocumentEditor.load({projectPath})
				.then((documentEditor)=>{
					IDE.GUID.documentEditor = documentEditor;

					IDE.GUID.userInterface = new UserInterface({
						documentEditor,
						dndContainerId:	'components'
					});

					// load Pannels
					IDE.GUID.panels = {};
					// Components
					IDE.GUID.panels.components = new Components({
						documentEditor,
						containerId: 'components'
					});
					// TODO: load angular
					// // angular panel
					// let angularPanel = IDE.GUID.panels.angularPanel = new Angular({
					// 	documentEditor,
					// 	containerId: 'angular',
					// 	userInterface: IDE.GUID.userInterface
					// });

					//to use it on devtool
					window.d = documentEditor;

					// activate
					loaded({
						GUID : documentEditor
					});

				}, (err)=>{
					console.error(err);
				});

		});

	}
}

export default Module;
