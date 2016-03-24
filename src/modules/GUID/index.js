var Module = {
	activate(loaded) {

		require.ensure([
			"./DocumentEditor",
			"./UserInterface",
			"./Pannels/Components"
		], function(require) {
			var DocumentEditor = require("./DocumentEditor");
			var UserInterface = require("./UserInterface");
			var Components = require("./Pannels/Components");


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
