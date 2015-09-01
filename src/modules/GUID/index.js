var Module = {
	activate(loaded) {
		//Core Plugin Editor
		IDE.GUID = {};

		require.ensure(["./DocumentEditor", "./UserInterface", "./Pannels/Outline"], function(require) {
			var Editor = require("./DocumentEditor");
			var UserInterface = require("./UserInterface");
			var Outline = require("./Pannels/Outline");
			let path = IDE.qParams.path;
			console.log(IDE.qParams.path);
			let strWebFolder = 'WebFolder';
			let i = path.indexOf(strWebFolder);
			path = path.substring(i + strWebFolder.length);
			//TODO mongoose.exe
			path = `http://localhost:9090${path}`;

			IDE.GUID.documentEditor = new Editor({
				path
			}).onReady(function(documentEditor) {

				IDE.GUID.userInterface = new UserInterface(documentEditor);
				IDE.GUID.documentEditorBroker = documentEditor.broker;

				// load Pannels
				IDE.GUID.panels = {};
				// Outline
				IDE.GUID.panels.outline = new Outline({
					containerId: 'outline'
				});
				// Components

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


				//to use it on devtool
				window.d = documentEditor;
				window.o = IDE.GUID.panels.outline;

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
