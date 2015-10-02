var Module = {
	activate(loaded) {
		//Core Plugin Editor
		IDE.GUID = {};

		require.ensure(["./DocumentEditor", "./UserInterface", "./Pannels/Outline", "./Pannels/Components", "./Pannels/AngularPanel"], function(require) {
			var Editor = require("./DocumentEditor");
			var UserInterface = require("./UserInterface");
			var Outline = require("./Pannels/Outline");
			var Components = require("./Pannels/Components");
			let path = IDE.qParams.path;
			// console.log(IDE.qParams.path);
			let strWebFolder = 'WebFolder';
			let i = path.indexOf(strWebFolder);
			path = path.substring(i + strWebFolder.length);
			//TODO mongoose.exe
			path = `http://localhost:9090${path}`;

			IDE.GUID.documentEditor = new Editor({
				path
			})
			.onReady((documentEditor) => {

				IDE.GUID.userInterface = new UserInterface({
					documentEditor,
					cloudEditorContainer: document.querySelector('.cloud-ide-editor')
				});
				IDE.GUID.documentEditorBroker = documentEditor.broker;

				// load Pannels
				IDE.GUID.panels = {};
				// Outline
				IDE.GUID.panels.outline = new Outline({
					containerId: 'outline',
					documentEditor
				});
				// Components
				// IDE.GUID.panels.htmlComponents = new Components({
				// 	documentEditor,
				// 	containerId: 'panel',
				// 	userInterface: IDE.GUID.userInterface
				// });
				// angular panel
				IDE.GUID.panels.angularPanel = new AngularPanel({
					documentEditor,
					containerId: 'panel',
					userInterface: IDE.GUID.userInterface
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

			//TODO remove this
			let tree = document.getElementById('tree');
			tree.hidden = true;
			console.log('explorer');

		});

	}
}

export default Module;
