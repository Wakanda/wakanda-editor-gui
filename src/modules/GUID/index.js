var Module = {
	activate(loaded) {
		//Core Plugin Editor
		IDE.GUID = {};

		require.ensure(["./DocumentEditor", "./UserInterface", "./Pannels/Outline", "./Pannels/Components", "./Pannels/Angular", "./Pannels/Styling", "./DragulaManager"], function(require) {
			var Editor = require("./DocumentEditor");
			var UserInterface = require("./UserInterface");
			var Outline = require("./Pannels/Outline");
			var Components = require("./Pannels/Components");
			var Angular = require("./Pannels/Angular");
			var Styling = require("./Pannels/Styling");
			var ResponsiveSelector = require('./Pannels/ResponsiveSelector');
			var DragulaManager = require('./DragulaManager');

			window.onhashchange = ()=>{
				//TODO - URL of the iframe content
				let path = './workspace/' + location.hash.substring(1);

				IDE.GUID.documentEditor = new Editor({
					path
				})
				.onReady((documentEditor) => {

					//NOTE DragulaManager must be initialized *before* UserInterface
					IDE.GUID.dragulaManager = new DragulaManager({
						documentEditor,
						sourceContainerId: 'components'
					});

					IDE.GUID.userInterface = new UserInterface({
						documentEditor
					});

					// load Pannels
					IDE.GUID.panels = {};
					// Outline
					IDE.GUID.panels.outline = new Outline({
						containerId: 'outline',
						documentEditor
					});
					// Components
					IDE.GUID.panels.components = new Components({
						documentEditor,
						containerId: 'components'
					});
					// angular panel
					let angularPanel = IDE.GUID.panels.angularPanel = new Angular({
						documentEditor,
						containerId: 'angular',
						userInterface: IDE.GUID.userInterface
					});

					IDE.GUID.panels.styling = new Styling({
						containerId: 'styling',
						documentEditor
					});

					IDE.GUID.panels.responsive = new ResponsiveSelector({
						documentEditor,
						containerId: 'responsiveButtonsList'
					});

					//undoRedoManagement
					let plugin = 'GuidHistoryManager',
						type = 'button';
					let items = [{
						action: 'undo',
						name: 'undo',
						plugin,
						type
					}, {
						action: 'redo',
						name: 'redo',
						plugin,
						type
					}];
					IDE.toolbar.addItems(items);
					// console.log(items);

					//debug infos
					// documentEditor.onElementSelected(function(arg) {
					// 	console.log(arg.element);
					// });

					// documentEditor.onDocumentSizeChange(function(a) {
					// 	console.log(a);
					// });

					//to use it on devtool
					window.d = documentEditor;
					window.o = IDE.GUID.panels.outline;

					// activate
					loaded();
				});
			}

			window.onhashchange();
			//TODO remove this
			let tree = document.getElementById('tree');
			tree.hidden = true;
			console.log('explorer');

		});

	}
}

export default Module;
