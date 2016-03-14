var Module = {
	activate(loaded) {
		//Core Plugin Editor
		IDE.GUID = {};

		require.ensure([
			"./DocumentEditor",
			"./UserInterface",
			"./Pannels/Outline",
			"./Pannels/Components",
			"./Pannels/Angular",
			"./Pannels/Styling",
			"./Pannels/Attributes"
		], function(require) {
			var DocumentEditor = require("./DocumentEditor");
			var UserInterface = require("./UserInterface");
			var Outline = require("./Pannels/Outline");
			var Components = require("./Pannels/Components");
			var Angular = require("./Pannels/Angular");
			var Styling = require("./Pannels/Styling");
			var AttributesPanel = require("./Pannels/Attributes");
			var ResponsiveSelector = require('./Pannels/ResponsiveSelector');


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
					// Outline
					IDE.GUID.panels.outline = new Outline({
						containerId: 'outline',
						documentEditor,
						userInterface: IDE.GUID.userInterface
					});
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

					IDE.GUID.panels.styling = new Styling({
						containerId: 'styling',
						documentEditor
					});

					IDE.GUID.panels.responsive = new ResponsiveSelector({
						documentEditor,
						containerId: 'responsiveButtonsList'
					});

					IDE.GUID.panels.attributesPanel = new AttributesPanel({
						documentEditor,
						containerId: 'attributes'
					});


					//to use it on devtool
					window.d = documentEditor;
					window.o = IDE.GUID.panels.outline;

					// activate
					loaded({
						GUID : documentEditor
					});

				}, (err)=>{
					console.error(err);
				});

			//TODO remove this
			let tree = document.getElementById('tree');
			tree.hidden = true;
			console.log('explorer');

		});

	}
}

export default Module;
