var Module = {
	activate({loaded, moduleArgs}) {

		require.ensure([
			"./DocumentEditor",
			"./UserInterface",
			"./Pannels/Components"
		], function(require) {
			var DocumentEditor = require("./DocumentEditor");
			var UserInterface = require("./UserInterface");
			var Components = require("./Pannels/Components");


			let projectPath = moduleArgs.filePath;

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
