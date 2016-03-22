var Module = {
	activate(loaded) {

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
					let GUID = {};
					GUID.documentEditor = documentEditor;

					GUID.userInterface = new UserInterface({
						documentEditor,
						dndContainerId:	'components'
					});

					// load Pannels
					GUID.panels = {};
					// Components
					GUID.panels.components = new Components({
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
					loaded(GUID);

				}, (err)=>{
					console.error(err);
				});

		});

	}
}

export default Module;
